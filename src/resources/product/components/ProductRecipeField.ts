import { Component, computed, input, model, signal } from '@angular/core';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { FormButton } from '@/components/form/Button';
import { FormNumberInput } from '@/components/form/Number';
import { FormSelect, type SelectValue } from '@/components/form/Select';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IProduct } from '../models/Product';

export type ProductRecipeEntry = {
  id: number;
  name: string;
  is_atomic: boolean;
  quantity_required: number | null;
};

/** Chave de tradução do erro da receita, ou `null` quando está válida (a receita pode ficar vazia). */
export function productRecipeError(entries: ProductRecipeEntry[]): string | null {
  if (entries.some((entry) => !entry.quantity_required || entry.quantity_required <= 0)) return 'forms.product.validation.componentQuantity';

  if (entries.some((entry) => entry.is_atomic && !Number.isInteger(entry.quantity_required))) return 'forms.product.validation.componentInteger';

  return null;
}

/**
 * Receita do produto: outros produtos e quanto de cada um vai em uma unidade.
 * Componente atômico (chapa, ovo contado) só em quantidade inteira.
 */
@Component({
  selector: 'app-product-recipe-field',
  imports: [FormSelect, FormNumberInput, FormButton, HlmTooltip, TranslatePipe],
  host: { class: 'flex flex-col gap-3' },
  template: `
    <div class="flex flex-col gap-1">
      <span class="text-sm font-medium">
        {{ 'forms.product.components.label' | t }}
      </span>

      <p class="text-sm text-muted-foreground">
        {{ 'forms.product.components.description' | t }}
      </p>
    </div>

    <div class="form-grid gap-3! items-end">
      <app-form-select
        class="col-span-12 sm:col-span-7"
        valueField="id"
        labelField="name"
        [placeholder]="'forms.product.components.selectPlaceholder' | t"
        [data]="availableProducts()"
        [(value)]="selectedProductId"
      />

      <app-form-number-input
        class="col-span-9 sm:col-span-4"
        [minValue]="0"
        [ariaLabel]="'forms.product.components.qtyPlaceholder' | t"
        [placeholder]="'forms.product.components.qtyPlaceholder' | t"
        [(value)]="newQuantity"
      />

      <button
        appButton
        size="icon"
        class="col-span-3 sm:col-span-1 w-full"
        icon="lucidePlus"
        [attr.aria-label]="'forms.product.components.add' | t"
        [hlmTooltip]="'forms.product.components.add' | t"
        [disabled]="!selectedProductId() || !newQuantity()"
        (click)="addComponent()"
      ></button>
    </div>

    <ul class="flex flex-col gap-2">
      @for (entry of recipe(); track entry.id) {
        <li class="flex items-center gap-2 bg-gray-50 p-2 pl-3 text-sm dark:bg-neutral-800">
          <span class="flex-1 truncate">
            {{ entry.name }}
          </span>

          <span class="text-xs text-muted-foreground">
            {{ (entry.is_atomic ? 'products.table.atomic' : 'products.table.bulk') | t }}
          </span>

          <app-form-number-input
            class="w-28"
            [minValue]="0"
            [step]="entry.is_atomic ? 1 : 'any'"
            [ariaLabel]="'forms.product.components.quantityOf' | t: { name: entry.name }"
            [value]="entry.quantity_required"
            (valueChange)="updateQuantity(entry.id, $event)"
          />

          <button
            appButton
            variant="ghost"
            size="icon-sm"
            icon="lucideX"
            class="text-destructive"
            [attr.aria-label]="'forms.product.components.remove' | t"
            [hlmTooltip]="'forms.product.components.remove' | t"
            (click)="removeComponent(entry.id)"
          ></button>
        </li>
      } @empty {
        <li class="py-1 text-xs text-gray-500 dark:text-gray-400">
          {{ 'forms.product.components.empty' | t }}
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
export class ProductRecipeField {
  readonly recipe = model.required<ProductRecipeEntry[]>();
  readonly products = input<readonly IProduct[]>([]);
  /** O próprio produto em edição (não pode entrar na própria receita). */
  readonly excludeId = input<number>();
  readonly showErrors = input(false);

  protected readonly selectedProductId = signal<SelectValue | null>(null);
  protected readonly newQuantity = signal<number | null>(1);

  protected readonly error = computed(() => productRecipeError(this.recipe()));

  protected readonly availableProducts = computed(() => {
    const selected = new Set(this.recipe().map((entry) => entry.id));
    return this.products().filter((product) => product.id !== this.excludeId() && !selected.has(product.id));
  });

  protected addComponent() {
    const product = this.products().find((candidate) => candidate.id === this.selectedProductId());
    const quantity = this.newQuantity();

    if (!product || !quantity || quantity <= 0) return;

    this.recipe.update((entries) => [...entries, { id: product.id, name: product.name, is_atomic: product.is_atomic, quantity_required: quantity }]);

    this.selectedProductId.set(null);
    this.newQuantity.set(1);
  }

  protected removeComponent(id: number) {
    this.recipe.update((entries) => entries.filter((entry) => entry.id !== id));
  }

  protected updateQuantity(id: number, quantity: number | null) {
    this.recipe.update((entries) => entries.map((entry) => (entry.id === id ? { ...entry, quantity_required: quantity } : entry)));
  }
}
