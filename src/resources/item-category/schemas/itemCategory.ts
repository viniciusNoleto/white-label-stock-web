import { computed, inject } from '@angular/core';
import * as yup from 'yup';
import { I18n } from '@/libs/i18n';

export const DEFAULT_CATEGORY_COLOR = '#6F1FF9';

/** Schema compartilhado entre CreateItemCategory e UpdateItemCategory. Reativo ao idioma. */
export function injectItemCategorySchema() {
  const i18n = inject(I18n);

  return computed(() => yup.object({
    name: yup.string().default('').trim().required(i18n.t('forms.category.validation.nameRequired')).max(100),
    color_hex: yup.string().default(DEFAULT_CATEGORY_COLOR).required(i18n.t('forms.category.validation.colorRequired')).matches(/^#[0-9a-f]{6}$/i),
  }));
}
