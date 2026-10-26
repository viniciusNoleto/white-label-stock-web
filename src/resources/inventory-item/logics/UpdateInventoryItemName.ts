import { Component, computed, inject, input, output, type Signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import * as yup from 'yup';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormTextInput } from '@/components/form/TextInput';
import { I18n } from '@/libs/i18n';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IInventoryItem } from '../models/InventoryItem';
import { updateInventoryItemNameService } from '../services/updateInventoryItemName';

export function injectUpdateInventoryItemNameLogicData({ editingItemId, onSuccess }: { editingItemId: Signal<number | undefined>; onSuccess: () => void }) {
  const i18n = inject(I18n);
  const notify = injectNotify();

  const updateItemNameSchema = computed(() => yup.object({
    name: yup.string().default('').trim().required(i18n.t('forms.inventoryItem.validation.nameRequired')).max(255),
  }));

  const updateItemNameValidatedFormState = validatedFormState(updateItemNameSchema);

  const updateItemNameMutation = createMutation({
    mutationFn: () => updateInventoryItemNameService({ itemId: editingItemId()!, body: updateItemNameValidatedFormState.state() }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateItemName'),
  });

  function updateItemNameInit(item: IInventoryItem) {
    updateItemNameValidatedFormState.reset({ name: item.name });
  }

  return { updateItemNameValidatedFormState, updateItemNameMutation, updateItemNameInit };
}

@Component({
  selector: 'app-update-inventory-item-name-logic',
  imports: [Form, FormField, FormTextInput, FormButton, TranslatePipe],
  template: `
    @let form = logicData().updateItemNameValidatedFormState;

    @let isPending = logicData().updateItemNameMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updateItemName()"
    >
      <app-form-text-input
        [label]="'forms.inventoryItem.name.label' | t"
        [placeholder]="'forms.inventoryItem.name.placeholder' | t"
        [formField]="form.field.name"
        withAsterisk
      />

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
export class UpdateInventoryItemNameLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateInventoryItemNameLogicData>>();
  readonly cancel = output<void>();

  protected updateItemName() {
    const { updateItemNameValidatedFormState, updateItemNameMutation } = this.logicData();

    if (!updateItemNameValidatedFormState.validate()) return;

    updateItemNameMutation.mutate();
  }
}
