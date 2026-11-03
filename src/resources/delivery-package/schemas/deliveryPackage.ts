import { computed, inject } from '@angular/core';
import * as yup from 'yup';
import { I18n } from '@/libs/i18n';

export const DELIVERY_PACKAGE_NOTES_MAX_LENGTH = 10000;

/**
 * Schema compartilhado entre CreateDeliveryPackage e UpdateDeliveryPackage. Reativo ao idioma.
 * Os itens ficam fora do schema (lista dinâmica, como os componentes do item) e são
 * validados por `deliveryPackageItemsError`.
 */
export function injectDeliveryPackageSchema() {
  const i18n = inject(I18n);

  return computed(() => yup.object({
    notes: yup.string()
      .default('')
      .max(DELIVERY_PACKAGE_NOTES_MAX_LENGTH, i18n.t('forms.deliveryPackage.validation.notesMax', { count: DELIVERY_PACKAGE_NOTES_MAX_LENGTH })),
  }));
}
