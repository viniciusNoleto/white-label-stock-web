import { Component, computed, input, model, signal } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { FormButton } from '@/components/form/Button';
import { FormNumberInput } from '@/components/form/Number';
import { FormSelect, type SelectValue } from '@/components/form/Select';
import { freeStock, type IProduct } from '@/resources/product/models/Product';
import { TranslatePipe } from '@/utils/translate.pipe';

/** `id` = id do produto. */
export type DeliveryPackageItemEntry = {
  id: number;
  name: string;
  isAtomic: boolean;
  unitAbbreviation: string;
  quantity: number | null;
};

/** Chave de tradução do erro da lista de itens, ou `null` quando está válida. */
export function deliveryPackageItemsError(entries: DeliveryPackageItemEntry[]): string | null {
  if (!entries.length) return 'forms.deliveryPackage.validation.itemsRequired';

  if (entries.some((entry) => !entry.quantity || entry.quantity <= 0)) return 'forms.deliveryPackage.validation.quantityPositive';

  if (entries.some((entry) => entry.isAtomic && !Number.isInteger(entry.quantity))) return 'forms.deliveryPackage.validation.integer';

  return null;
}

/**
 * Escolha dos produtos e da quantidade de cada um no pacote. Mostra quanto de cada produto
 * ainda está livre (estoque − reservado em outros pacotes pendentes); a API recusa o que
 * passar disso e escolhe os itens (códigos) por FEFO.
 */
@Component({
  selector: 'app-delivery-package-items-field',
  imports: [FormSelect, FormNumberInput, FormButton, HlmBadge, HlmTooltip, TranslatePipe],
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
        labelField="name"
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

        <li class="flex flex-wrap items-center gap-2 p-2 pl-3 bg-gray-50 dark:bg-neutral-800 rounded-lg text-sm">
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
  readonly items = model.required<DeliveryPackageItemEntry[]>();
  readonly stockItems = input<readonly IProduct[]>([]);
  /** Quantidades que o próprio pacote (em edição) já separou — contam como livres para ele. */
  readonly ownQuantities = input<Record<number, number>>({});
  readonly showErrors = input(false);

  protected readonly selectedItemId = signal<SelectValue | null>(null);
  protected readonly newQuantity = signal<number | null>(1);

  protected readonly error = computed(() => deliveryPackageItemsError(this.items()));

  private readonly stockById = computed(() => new Map(this.stockItems().map((item) => [item.id, item])));

  protected readonly availableStockItems = computed(() => {
    const selected = new Set(this.items().map((entry) => entry.id));
    return this.stockItems().filter((item) => !selected.has(item.id));
  });

  protected freeOf(id: number): number | null {
    const stock = this.stockById().get(id);
    return stock ? freeStock(stock, this.ownQuantities()[id] ?? 0) : null;
  }

  protected addItem() {
    const item = this.stockById().get(this.selectedItemId() as number);
    const quantity = this.newQuantity();

    if (!item || !quantity || quantity <= 0) return;

    this.items.update((entries) => [...entries, { id: item.id, name: item.name, isAtomic: item.is_atomic, unitAbbreviation: item.unit.abbreviation, quantity }]);

    this.selectedItemId.set(null);
    this.newQuantity.set(1);
  }

  protected removeItem(id: number) {
    this.items.update((entries) => entries.filter((entry) => entry.id !== id));
  }

  protected updateQuantity(id: number, quantity: number | null) {
    this.items.update((entries) => entries.map((entry) => (entry.id === id ? { ...entry, quantity } : entry)));
  }
}
