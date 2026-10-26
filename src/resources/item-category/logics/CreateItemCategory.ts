import { Component, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormColorInput } from '@/components/form/ColorInput';
import { FormTextInput } from '@/components/form/TextInput';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { injectItemCategorySchema } from '../schemas/itemCategory';
import { createItemCategoryService } from '../services/createItemCategory';

export function injectCreateItemCategoryLogicData({ onSuccess }: { onSuccess: () => void }) {
  const notify = injectNotify();

  const createItemCategoryValidatedFormState = validatedFormState(injectItemCategorySchema());

  const createItemCategoryMutation = createMutation({
    mutationFn: () => createItemCategoryService({ body: createItemCategoryValidatedFormState.state() }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.createCategory'),
  });

  function createItemCategoryReset() {
    createItemCategoryValidatedFormState.reset();
  }

  return { createItemCategoryValidatedFormState, createItemCategoryMutation, createItemCategoryReset };
}

@Component({
  selector: 'app-create-item-category-logic',
  imports: [Form, FormField, FormTextInput, FormColorInput, FormButton, TranslatePipe],
  template: `
    @let form = logicData().createItemCategoryValidatedFormState;

    @let isPending = logicData().createItemCategoryMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="createItemCategory()"
    >
      <div class="form-grid">
        <app-form-text-input
          class="col-span-12"
          [label]="'forms.category.name.label' | t"
          [placeholder]="'forms.category.name.placeholder' | t"
          [formField]="form.field.name"
          withAsterisk
        />

        <app-form-color-input
          class="col-span-12"
          [label]="'forms.category.color.label' | t"
          [placeholder]="'forms.category.color.placeholder' | t"
          [formField]="form.field.color_hex"
          withAsterisk
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
export class CreateItemCategoryLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectCreateItemCategoryLogicData>>();
  readonly cancel = output<void>();

  protected createItemCategory() {
    const { createItemCategoryValidatedFormState, createItemCategoryMutation } = this.logicData();

    if (!createItemCategoryValidatedFormState.validate()) return;

    createItemCategoryMutation.mutate();
  }
}
