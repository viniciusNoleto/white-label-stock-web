import { computed, inject } from '@angular/core';
import * as yup from 'yup';
import { I18n } from '@/libs/i18n';

/** Schema compartilhado entre CreateStorage e UpdateStorage. Reativo ao idioma. */
export function injectStorageSchema() {
  const i18n = inject(I18n);

  return computed(() => yup.object({
    name: yup.string().default('').trim().required(i18n.t('forms.storage.validation.nameRequired')).max(100),
    description: yup.string().default(''),
  }));
}
