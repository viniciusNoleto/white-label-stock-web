import { Component, computed, inject, input, model, signal } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { FormButton } from '@/components/form/Button';
import { FormNumberInput } from '@/components/form/Number';
import { FormSegmentedControl } from '@/components/form/SegmentedControl';
import { FormSelect, type SelectValue } from '@/components/form/Select';
import { I18n } from '@/libs/i18n';
import { freeStock, type IProduct } from '@/resources/product/models/Product';
import { TranslatePipe } from '@/utils/translate.pipe';
import { EAllocationMode } from '../enums/AllocationMode';
import { DeliveryPackageItemPicker } from './DeliveryPackageItemPicker';

/**
 * `id` = id do produto. Atômico em `MANUAL`: `itemIds` = itens escolhidos um a um, que precisam
 * ser exatamente `quantity`; em `FEFO` (padrão) a API pega os que vencem primeiro.
 */
export type DeliveryPackageItemEntry = {
  id: number;
  name: string;
  isAtomic: boolean;
  unitAbbreviation: string;
  quantity: number | null;
  allocationMode: EAllocationMode;
  itemIds: number[];
};

/** Itens do payload de criar/editar pacote (`item_ids` só no atômico escolhido à mão). */
export function deliveryPackageItemsPayload(entries: DeliveryPackageItemEntry[]) {
  return entries.map((entry) => (entry.isAtomic && entry.allocationMode === EAllocationMode.MANUAL
    ? { product_id: entry.id, quantity: entry.itemIds.length, item_ids: entry.itemIds }
    : { product_id: entry.id, quantity: entry.quantity ?? 0 }));
}

/** Chave de tradução do erro da lista de itens, ou `null` quando está válida. */
export function deliveryPackageItemsError(entries: DeliveryPackageItemEntry[]): string | null {
  if (!entries.length) return 'forms.deliveryPackage.validation.itemsRequired';

  if (entries.some((entry) => !entry.quantity || entry.quantity <= 0)) return 'forms.deliveryPackage.validation.quantityPositive';

  if (entries.some((entry) => entry.isAtomic && !Number.isInteger(entry.quantity))) return 'forms.deliveryPackage.validation.integer';

  if (entries.some((entry) => entry.isAtomic && entry.allocationMode === EAllocationMode.MANUAL && entry.itemIds.length !== entry.quantity)) {
    return 'forms.deliveryPackage.validation.selectionMismatch';
  }

  return null;
}

/**
 * Escolha dos produtos e da quantidade de cada um no pacote. Mostra quanto de cada produto
 * ainda está livre (estoque − reservado em outros pacotes pendentes); a API recusa o que
 * passar disso. Atômico: a API pega os que vencem primeiro (FEFO) ou o usuário escolhe item a item.
 */
@Component({
  selector: 'app-delivery-package-items-field',
  imports: [FormSelect, FormNumberInput, FormSegmentedControl, FormButton, HlmBadge, HlmTooltip, DeliveryPackageItemPicker, TranslatePipe],
  host: { class: 'flex flex-col gap-3' },
  template: `
    <span class="text-sm font-medium">
      {{ 'forms.deliveryPackage.items.label' | t }}

      <span class="text-destructive">
        *
      </span>
    </span>

    <div class="form-grid gap-3! items-end">
      <app-form-select
        class="col-span-12 sm:col-span-7"
        valueField="id"
        labelField="label"
        [placeholder]="'forms.deliveryPackage.items.selectPlaceholder' | t"
        [data]="availableStockItems()"
        [(value)]="selectedItemId"
      />

      <app-form-number-input
        class="col-span-9 sm:col-span-4"
        [minValue]="0"
        [ariaLabel]="'forms.deliveryPackage.items.qtyPlaceholder' | t"
        [placeholder]="'forms.deliveryPackage.items.qtyPlaceholder' | t"
        [(value)]="newQuantity"
      />

      <button
        appButton
        size="icon"
        class="col-span-3 sm:col-span-1 w-full"
        icon="lucidePlus"
        [attr.aria-label]="'forms.deliveryPackage.items.add' | t"
        [hlmTooltip]="'forms.deliveryPackage.items.add' | t"
        [disabled]="!selectedItemId() || !newQuantity()"
        (click)="addItem()"
      ></button>
    </div>

    <ul class="flex flex-col gap-2">
      @for (entry of items(); track entry.id) {
        @let free = freeOf(entry.id);

        @let manual = entry.isAtomic && entry.allocationMode === allocationModes.MANUAL;

        <li class="flex flex-col gap-3 border border-gray-200 p-3 text-sm dark:border-gray-800">
          <div class="flex flex-wrap items-center gap-2">
            <span class="flex-1 min-w-32 truncate">
              {{ entry.name }}
            </span>

            @if (free !== null) {
              <span
                hlmBadge
                [variant]="(entry.quantity ?? 0) > free ? 'destructive' : 'secondary'"
              >
                {{ 'forms.deliveryPackage.items.free' | t: { count: free, unit: entry.unitAbbreviation } }}
              </span>
            }

            <app-form-number-input
              class="w-28"
              [minValue]="0"
              [ariaLabel]="'forms.deliveryPackage.items.quantityOf' | t: { name: entry.name }"
              [value]="entry.quantity"
              (valueChange)="updateQuantity(entry.id, $event)"
            />

            <button
              appButton
              variant="ghost"
              size="icon-sm"
              icon="lucideX"
              class="text-destructive"
              [attr.aria-label]="'forms.deliveryPackage.items.remove' | t"
              [hlmTooltip]="'forms.deliveryPackage.items.remove' | t"
              (click)="removeItem(entry.id)"
            ></button>
          </div>

          @if (entry.isAtomic) {
            <app-form-segmented-control
              [data]="[
                { value: allocationModes.FEFO, label: 'forms.deliveryPackage.items.mode.fefo' | t },
                { value: allocationModes.MANUAL, label: 'forms.deliveryPackage.items.mode.manual' | t },
              ]"
              [description]="(manual ? 'forms.deliveryPackage.items.mode.manualDescription' : 'forms.deliveryPackage.items.mode.fefoDescription') | t"
              [value]="entry.allocationMode"
              (valueChange)="changeAllocationMode(entry.id, $any($event))"
            />

            @if (manual) {
              <app-delivery-package-item-picker
                [productId]="entry.id"
                [quantity]="entry.quantity"
                [ownItemIds]="ownItemIds()"
                [itemIds]="entry.itemIds"
                (itemIdsChange)="updateItemIds(entry.id, $event)"
              />
            }
          }
        </li>
      } @empty {
        <li class="text-xs text-gray-500 dark:text-gray-400 py-1">
          {{ 'forms.deliveryPackage.items.empty' | t }}
        </li>
      }
    </ul>

    @if (showErrors() && error(); as errorKey) {
      <p
        role="alert"
        class="text-sm text-destructive"
      >
        {{ errorKey | t }}
      </p>
    }
  `,
})
export class DeliveryPackageItemsField {
  private readonly i18n = inject(I18n);

  readonly items = model.required<DeliveryPackageItemEntry[]>();
  readonly stockItems = input<readonly IProduct[]>([]);
  /** Quantidades que o próprio pacote (em edição) já separou — contam como livres para ele. */
  readonly ownQuantities = input<Record<number, number>>({});
  /** Itens que o próprio pacote (em edição) já separou — podem ser escolhidos de novo. */
  readonly ownItemIds = input<readonly number[]>([]);
  readonly showErrors = input(false);

  protected readonly allocationModes = EAllocationMode;

  protected readonly selectedItemId = signal<SelectValue | null>(null);
  protected readonly newQuantity = signal<number | null>(1);

  protected readonly error = computed(() => deliveryPackageItemsError(this.items()));

  private readonly stockById = computed(() => new Map(this.stockItems().map((item) => [item.id, item])));

  protected readonly availableStockItems = computed(() => {
    const selected = new Set(this.items().map((entry) => entry.id));

    return this.stockItems()
      .filter((item) => !selected.has(item.id))
      .map((item) => ({
        id: item.id,
        label: this.i18n.t('forms.deliveryPackage.items.option', {
          name: item.name,
          count: freeStock(item, this.ownQuantities()[item.id] ?? 0),
          unit: item.unit.abbreviation,
        }),
      }));
  });

  protected freeOf(id: number): number | null {
    const stock = this.stockById().get(id);
    return stock ? freeStock(stock, this.ownQuantities()[id] ?? 0) : null;
  }

  protected addItem() {
    const item = this.stockById().get(this.selectedItemId() as number);
    const quantity = this.newQuantity();

    if (!item || !quantity || quantity <= 0) return;

    this.items.update((entries) => [...entries, {
      id: item.id,
      name: item.name,
      isAtomic: item.is_atomic,
      unitAbbreviation: item.unit.abbreviation,
      quantity,
      allocationMode: EAllocationMode.FEFO,
      itemIds: [],
    }]);

    this.selectedItemId.set(null);
    this.newQuantity.set(1);
  }

  protected removeItem(id: number) {
    this.items.update((entries) => entries.filter((entry) => entry.id !== id));
  }

  protected updateQuantity(id: number, quantity: number | null) {
    this.updateEntry(id, { quantity });
  }

  /** A quantidade é a mesma nos dois modos: no item a item, é quantos itens precisam ser escolhidos. */
  protected changeAllocationMode(id: number, allocationMode: EAllocationMode) {
    this.updateEntry(id, { allocationMode });
  }

  protected updateItemIds(id: number, itemIds: number[]) {
    this.updateEntry(id, { itemIds });
  }

  private updateEntry(id: number, changes: Partial<DeliveryPackageItemEntry>) {
    this.items.update((entries) => entries.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry)));
  }
}
