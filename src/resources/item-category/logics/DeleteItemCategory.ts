import { Component, input, output, type Signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { deleteItemCategoryService } from '../services/deleteItemCategory';

export function injectDeleteItemCategoryLogicData({ editingItemCategoryId, onSuccess }: { editingItemCategoryId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const deleteItemCategoryMutation = createMutation({
    mutationFn: () => deleteItemCategoryService({ itemCategoryId: editingItemCategoryId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.deleteCategory'),
  });

  return { deleteItemCategoryMutation };
}

@Component({
  selector: 'app-delete-item-category-logic',
  imports: [FormButton, TranslatePipe],
  template: `
    @let isPending = logicData().deleteItemCategoryMutation.isPending();

    <div class="flex flex-col gap-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'categories.delete.confirm' | t: { name: itemCategoryName() } }}
      </p>

      <div class="flex justify-end gap-2">
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
          variant="destructive"
          [loading]="isPending"
          (click)="logicData().deleteItemCategoryMutation.mutate()"
        >
          {{ 'common.actions.delete' | t }}
        </button>
      </div>
    </div>
  `,
})
export class DeleteItemCategoryLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectDeleteItemCategoryLogicData>>();
  readonly itemCategoryName = input.required<string>();
  readonly cancel = output<void>();
}
