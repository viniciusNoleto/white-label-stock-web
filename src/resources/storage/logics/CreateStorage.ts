import { Component, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/Textarea';
import { FormTextInput } from '@/components/form/TextInput';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { injectStorageSchema } from '../schemas/storage';
import { createStorageService } from '../services/createStorage';

export function injectCreateStorageLogicData({ onSuccess }: { onSuccess: () => void }) {
  const notify = injectNotify();

  const createStorageValidatedFormState = validatedFormState(injectStorageSchema());

  const createStorageMutation = createMutation({
    mutationFn: () => createStorageService({ body: createStorageValidatedFormState.state() }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.createStorage'),
  });

  function createStorageReset() {
    createStorageValidatedFormState.reset();
  }

  return { createStorageValidatedFormState, createStorageMutation, createStorageReset };
}

@Component({
  selector: 'app-create-storage-logic',
  imports: [Form, FormField, FormTextInput, FormTextarea, FormButton, TranslatePipe],
  template: `
    @let form = logicData().createStorageValidatedFormState;

    @let isPending = logicData().createStorageMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="createStorage()"
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
export class CreateStorageLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectCreateStorageLogicData>>();
  readonly cancel = output<void>();

  protected createStorage() {
    const { createStorageValidatedFormState, createStorageMutation } = this.logicData();

    if (!createStorageValidatedFormState.validate()) return;

    createStorageMutation.mutate();
  }
}
