import { Component, computed, input, model } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FormMultiSelect } from '@/components/form/MultiSelect';
import { FormNumberInput } from '@/components/form/Number';
import { FormSegmentedControl } from '@/components/form/SegmentedControl';
import { FormSelect } from '@/components/form/Select';
import { FormTextInput } from '@/components/form/TextInput';
import { getItemCategoriesService } from '@/resources/item-category/services/getItemCategories';
import { getUnitsService } from '@/resources/unit/services/getUnits';
import type { ValidatedFormState } from '@/utils/form';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { EProductMode } from '../enums/ProductMode';
import type { ProductFormValues } from '../schemas/product';
import { getProductsService } from '../services/getProducts';
import { type ProductRecipeEntry, ProductRecipeField } from './ProductRecipeField';

/** Campos do produto, compartilhados entre criar e editar (cada logic tem o próprio `<form>`). */
@Component({
  selector: 'app-product-form-fields',
  imports: [FormField, FormTextInput, FormSelect, FormNumberInput, FormMultiSelect, FormSegmentedControl, ProductRecipeField, TranslatePipe],
  host: { class: 'form-grid' },
  template: `
    @let fields = form().field;

    @let mode = form().state().mode;

    <app-form-text-input
      class="col-span-12 sm:col-span-8"
      [label]="'forms.product.name.label' | t"
      [placeholder]="'forms.product.name.placeholder' | t"
      [formField]="fields.name"
      withAsterisk
    />

    <app-form-text-input
      class="col-span-12 sm:col-span-4"
      [label]="'forms.product.sku.label' | t"
      [placeholder]="'forms.product.sku.placeholder' | t"
      [formField]="fields.sku"
    />

    <app-form-segmented-control
      class="col-span-12"
      [label]="'forms.product.mode.label' | t"
      [description]="(modeLocked() ? 'forms.product.mode.locked' : 'forms.product.mode.' + mode + 'Description') | t"
      [data]="[
        { value: modes.ATOMIC, label: 'forms.product.mode.atomic' | t },
        { value: modes.BULK, label: 'forms.product.mode.bulk' | t },
      ]"
      [value]="mode"
      [disabled]="modeLocked()"
      (valueChange)="form().setValue('mode', $any($event))"
    />

    <app-form-select
      class="col-span-12 sm:col-span-6"
      valueField="id"
      labelField="name"
      [label]="'forms.product.unit.label' | t"
      [placeholder]="'forms.product.unit.placeholder' | t"
      [data]="units()"
      [formField]="fields.unit_id"
      withAsterisk
    />

    <app-form-number-input
      class="col-span-12 sm:col-span-6"
      [minValue]="1"
      [step]="1"
      [label]="'forms.product.shelfLife.label' | t"
      [placeholder]="'forms.product.shelfLife.placeholder' | t"
      [description]="'forms.product.shelfLife.description' | t"
      [formField]="fields.shelf_life_days"
    />

    <app-form-multi-select
      class="col-span-12"
      valueField="id"
      labelField="name"
      [label]="'forms.product.categories.label' | t"
      [placeholder]="'forms.product.categories.placeholder' | t"
      [data]="categories()"
      [formField]="fields.category_ids"
    />

    <app-product-recipe-field
      class="col-span-12"
      [products]="products()"
      [excludeId]="productId()"
      [showErrors]="showRecipeErrors()"
      [(recipe)]="recipe"
    />
  `,
})
export class ProductFormFields {
  readonly form = input.required<ValidatedFormState<ProductFormValues>>();
  readonly recipe = model.required<ProductRecipeEntry[]>();
  readonly productId = input<number>();
  readonly modeLocked = input(false);
  readonly showRecipeErrors = input(false);

  protected readonly modes = EProductMode;

  private readonly unitsQuery = createQuery({ queryFn: () => getUnitsService() });
  private readonly categoriesQuery = createQuery({ queryFn: () => getItemCategoriesService() });
  private readonly productsQuery = createQuery({ queryFn: () => getProductsService({ query: { per_page: 100 } }) });

  protected readonly units = computed(() => this.unitsQuery.data()?.data ?? []);
  protected readonly categories = computed(() => this.categoriesQuery.data()?.data ?? []);
  protected readonly products = computed(() => this.productsQuery.data()?.data.items ?? []);
}
