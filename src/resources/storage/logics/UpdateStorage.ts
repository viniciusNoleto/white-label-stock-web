import { Component, input, output, type Signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/Textarea';
import { FormTextInput } from '@/components/form/TextInput';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IStorage } from '../models/Storage';
import { injectStorageSchema } from '../schemas/storage';
import { updateStorageService } from '../services/updateStorage';

export function injectUpdateStorageLogicData({ editingStorageId, onSuccess }: { editingStorageId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const updateStorageValidatedFormState = validatedFormState(injectStorageSchema());

  const updateStorageMutation = createMutation({
    mutationFn: () => updateStorageService({ storageId: editingStorageId()!, body: updateStorageValidatedFormState.state() }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateStorage'),
  });

  function updateStorageInit(storage: IStorage) {
    updateStorageValidatedFormState.reset({ name: storage.name, description: storage.description ?? '' });
  }

  return { updateStorageValidatedFormState, updateStorageMutation, updateStorageInit };
}

@Component({
  selector: 'app-update-storage-logic',
  imports: [Form, FormField, FormTextInput, FormTextarea, FormButton, TranslatePipe],
  template: `
    @let form = logicData().updateStorageValidatedFormState;

    @let isPending = logicData().updateStorageMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updateStorage()"
    >
      <div class="form-grid">
        <app-form-text-input
          class="col-span-12"
          [label]="'forms.storage.name.label' | t"
          [placeholder]="'forms.storage.name.placeholder' | t"
          [formField]="form.field.name"
          withAsterisk
        />

        <app-form-textarea
          class="col-span-12"
          [label]="'forms.storage.description.label' | t"
          [placeholder]="'forms.storage.description.placeholder' | t"
          [rows]="3"
          [formField]="form.field.description"
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
export class UpdateStorageLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateStorageLogicData>>();
  readonly cancel = output<void>();

  protected updateStorage() {
    const { updateStorageValidatedFormState, updateStorageMutation } = this.logicData();

    if (!updateStorageValidatedFormState.validate()) return;

    updateStorageMutation.mutate();
  }
}
