import { Component, input, output, type Signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormColorInput } from '@/components/form/ColorInput';
import { FormTextInput } from '@/components/form/TextInput';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IItemCategory } from '../models/ItemCategory';
import { injectItemCategorySchema } from '../schemas/itemCategory';
import { updateItemCategoryService } from '../services/updateItemCategory';

export function injectUpdateItemCategoryLogicData({ editingItemCategoryId, onSuccess }: { editingItemCategoryId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const updateItemCategoryValidatedFormState = validatedFormState(injectItemCategorySchema());

  const updateItemCategoryMutation = createMutation({
    mutationFn: () => updateItemCategoryService({ itemCategoryId: editingItemCategoryId()!, body: updateItemCategoryValidatedFormState.state() }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateCategory'),
  });

  function updateItemCategoryInit(itemCategory: IItemCategory) {
    updateItemCategoryValidatedFormState.reset({ name: itemCategory.name, color_hex: itemCategory.color_hex });
  }

  return { updateItemCategoryValidatedFormState, updateItemCategoryMutation, updateItemCategoryInit };
}

@Component({
  selector: 'app-update-item-category-logic',
  imports: [Form, FormField, FormTextInput, FormColorInput, FormButton, TranslatePipe],
  template: `
    @let form = logicData().updateItemCategoryValidatedFormState;

    @let isPending = logicData().updateItemCategoryMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updateItemCategory()"
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
export class UpdateItemCategoryLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateItemCategoryLogicData>>();
  readonly cancel = output<void>();

  protected updateItemCategory() {
    const { updateItemCategoryValidatedFormState, updateItemCategoryMutation } = this.logicData();

    if (!updateItemCategoryValidatedFormState.validate()) return;

    updateItemCategoryMutation.mutate();
  }
}
