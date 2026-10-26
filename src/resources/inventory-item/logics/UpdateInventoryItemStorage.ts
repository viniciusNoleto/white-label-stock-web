import { Component, computed, input, output, type Signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import * as yup from 'yup';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormSelect } from '@/components/form/Select';
import { getStoragesService } from '@/resources/storage/services/getStorages';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation, createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IInventoryItem } from '../models/InventoryItem';
import { updateInventoryItemStorageService } from '../services/updateInventoryItemStorage';

const updateItemStorageSchema = yup.object({
  storage_id: yup.number().nullable().default(null),
});

export function injectUpdateInventoryItemStorageLogicData({ editingItemId, onSuccess }: { editingItemId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const updateItemStorageValidatedFormState = validatedFormState(updateItemStorageSchema);

  const updateItemStorageMutation = createMutation({
    mutationFn: () => updateInventoryItemStorageService({
      itemId: editingItemId()!,
      body: { storage_id: updateItemStorageValidatedFormState.state().storage_id },
    }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateItemStorage'),
  });

  function updateItemStorageInit(item: IInventoryItem) {
    updateItemStorageValidatedFormState.reset({ storage_id: item.storage?.id ?? null });
  }

  return { updateItemStorageValidatedFormState, updateItemStorageMutation, updateItemStorageInit };
}

@Component({
  selector: 'app-update-inventory-item-storage-logic',
  imports: [Form, FormField, FormSelect, FormButton, TranslatePipe],
  template: `
    @let form = logicData().updateItemStorageValidatedFormState;

    @let isPending = logicData().updateItemStorageMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updateItemStorage()"
    >
      <app-form-select
        valueField="id"
        labelField="name"
        [clearable]="true"
        [label]="'forms.inventoryItem.storage.label' | t"
        [placeholder]="'forms.inventoryItem.storage.placeholder' | t"
        [data]="storages()"
        [formField]="form.field.storage_id"
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
export class UpdateInventoryItemStorageLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateInventoryItemStorageLogicData>>();
  readonly cancel = output<void>();

  private readonly storagesQuery = createQuery({ queryFn: () => getStoragesService() });

  protected readonly storages = computed(() => this.storagesQuery.data()?.data ?? []);

  protected updateItemStorage() {
    const { updateItemStorageValidatedFormState, updateItemStorageMutation } = this.logicData();

    if (!updateItemStorageValidatedFormState.validate()) return;

    updateItemStorageMutation.mutate();
  }
}
