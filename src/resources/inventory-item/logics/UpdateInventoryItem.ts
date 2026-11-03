import { Component, computed, inject, input, output, type Signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import * as yup from 'yup';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormMultiSelect } from '@/components/form/MultiSelect';
import { FormSelect } from '@/components/form/Select';
import { FormTextInput } from '@/components/form/TextInput';
import { I18n } from '@/libs/i18n';
import { getItemCategoriesService } from '@/resources/item-category/services/getItemCategories';
import { getUnitsService } from '@/resources/unit/services/getUnits';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation, createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IInventoryItem } from '../models/InventoryItem';
import { updateInventoryItemService } from '../services/updateInventoryItem';

export function injectUpdateInventoryItemLogicData({ editingItemId, onSuccess }: { editingItemId: Signal<number | undefined>; onSuccess: () => void }) {
  const i18n = inject(I18n);
  const notify = injectNotify();

  const updateItemSchema = computed(() => yup.object({
    name: yup.string().default('').trim().required(i18n.t('forms.inventoryItem.validation.nameRequired')).max(255),
    unit_id: yup.number().nullable().default(null).required(i18n.t('forms.inventoryItem.validation.unitRequired')),
    category_ids: yup.array(yup.number().required()).default([]),
  }));

  const updateItemValidatedFormState = validatedFormState(updateItemSchema);

  const updateItemMutation = createMutation({
    mutationFn: () => {
      const { name, unit_id, category_ids } = updateItemValidatedFormState.state();

      return updateInventoryItemService({ itemId: editingItemId()!, body: { name, unit_id: unit_id!, category_ids } });
    },
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateItem'),
  });

  function updateItemInit(item: IInventoryItem) {
    updateItemValidatedFormState.reset({
      name: item.name,
      unit_id: item.unit.id,
      category_ids: item.categories.map((category) => category.id),
    });
  }

  return { updateItemValidatedFormState, updateItemMutation, updateItemInit };
}

/** Edição dos dados do item (nome, unidade, categorias). Armazenamento e quantidade têm modais próprios. */
@Component({
  selector: 'app-update-inventory-item-logic',
  imports: [Form, FormField, FormTextInput, FormSelect, FormMultiSelect, FormButton, TranslatePipe],
  template: `
    @let form = logicData().updateItemValidatedFormState;

    @let isPending = logicData().updateItemMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updateItem()"
    >
      <div class="form-grid">
        <app-form-text-input
          class="col-span-12"
          [label]="'forms.inventoryItem.name.label' | t"
          [placeholder]="'forms.inventoryItem.name.placeholder' | t"
          [formField]="form.field.name"
          withAsterisk
        />

        <app-form-select
          class="col-span-12"
          valueField="id"
          labelField="name"
          [label]="'forms.inventoryItem.unit.label' | t"
          [placeholder]="'forms.inventoryItem.unit.placeholder' | t"
          [data]="units()"
          [formField]="form.field.unit_id"
          withAsterisk
        />

        <app-form-multi-select
          class="col-span-12"
          valueField="id"
          labelField="name"
          [label]="'forms.inventoryItem.categories.label' | t"
          [placeholder]="'forms.inventoryItem.categories.placeholder' | t"
          [data]="categories()"
          [formField]="form.field.category_ids"
        />
      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          appButton
          variant="ghost"
          [disabled]="isPending"
          (click)="cancel.emit()"
        >
          {{ 'common.actions.cancel' | t }}
        </button>

        <button
          appButton
          type="submit"
          [loading]="isPending"
        >
          {{ 'common.actions.save' | t }}
        </button>
      </div>
    </form>
  `,
})
export class UpdateInventoryItemLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateInventoryItemLogicData>>();
  readonly cancel = output<void>();

  private readonly unitsQuery = createQuery({ queryFn: () => getUnitsService() });
  private readonly categoriesQuery = createQuery({ queryFn: () => getItemCategoriesService() });

  protected readonly units = computed(() => this.unitsQuery.data()?.data ?? []);
  protected readonly categories = computed(() => this.categoriesQuery.data()?.data ?? []);

  protected updateItem() {
    const { updateItemValidatedFormState, updateItemMutation } = this.logicData();

    if (!updateItemValidatedFormState.validate()) return;

    updateItemMutation.mutate();
  }
}
