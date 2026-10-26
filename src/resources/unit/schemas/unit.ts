import { computed, inject } from '@angular/core';
import * as yup from 'yup';
import { I18n } from '@/libs/i18n';

/** Schema compartilhado entre CreateUnit e UpdateUnit. Reativo ao idioma. */
export function injectUnitSchema() {
  const i18n = inject(I18n);

  return computed(() => yup.object({
    name: yup.string().default('').trim().required(i18n.t('forms.unit.validation.nameRequired')).max(100),
    abbreviation: yup.string().default('').trim().required(i18n.t('forms.unit.validation.abbreviationRequired')).max(20),
  }));
}
