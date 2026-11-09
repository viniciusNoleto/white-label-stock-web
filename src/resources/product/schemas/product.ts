import { computed, inject } from '@angular/core';
import * as yup from 'yup';
import { I18n } from '@/libs/i18n';
import type { ProductRecipeEntry } from '../components/ProductRecipeField';
import { EProductMode } from '../enums/ProductMode';
import type { IProduct } from '../models/Product';
import type { CreateProductServicePayload } from '../services/createProduct';

function buildProductSchema(t: (key: string) => string) {
  return yup.object({
    name: yup.string().default('').trim().required(t('forms.product.validation.nameRequired')).max(255),
    sku: yup.string().default('').trim().max(40).matches(/^[\p{L}\p{N}._\-\s]*$/u, t('forms.product.validation.sku')),
    unit_id: yup.number().nullable().default(null).required(t('forms.product.validation.unitRequired')),
    mode: yup.mixed<EProductMode>().oneOf(Object.values(EProductMode)).default(EProductMode.ATOMIC).required(),
    shelf_life_days: yup.number()
      .nullable()
      .default(null)
      .integer(t('forms.product.validation.shelfLife'))
      .min(1, t('forms.product.validation.shelfLife')),
    category_ids: yup.array(yup.number().required()).default([]),
  });
}

export type ProductFormValues = yup.InferType<ReturnType<typeof buildProductSchema>>;

/** Schema compartilhado entre CreateProduct e UpdateProduct. Reativo ao idioma. A receita fica fora (lista dinâmica). */
export function injectProductSchema() {
  const i18n = inject(I18n);

  return computed(() => buildProductSchema((key) => i18n.t(key)));
}

/** Valores do formulário a partir de um produto (edição). */
export function productFormValues(product: IProduct): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku ?? '',
    unit_id: product.unit.id,
    mode: product.is_atomic ? EProductMode.ATOMIC : EProductMode.BULK,
    shelf_life_days: product.shelf_life_days,
    category_ids: product.categories.map((category) => category.id),
  };
}

export function productRecipeEntries(product: IProduct): ProductRecipeEntry[] {
  return product.components.map((component) => ({
    id: component.id,
    name: component.name,
    is_atomic: component.is_atomic,
    quantity_required: Number(component.quantity_required),
  }));
}

/** Corpo de criar/editar produto. */
export function productPayload(values: ProductFormValues, recipe: ProductRecipeEntry[]): CreateProductServicePayload {
  return {
    name: values.name,
    sku: values.sku.trim() || null,
    unit_id: values.unit_id!,
    is_atomic: values.mode === EProductMode.ATOMIC,
    shelf_life_days: values.shelf_life_days,
    category_ids: values.category_ids,
    components: recipe.map((entry) => ({ id: entry.id, quantity_required: entry.quantity_required ?? 0 })),
  };
}
