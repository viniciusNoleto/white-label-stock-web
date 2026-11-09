import { Component, input, output, type Signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { deleteItemService } from '../services/deleteItem';

export function injectDeleteItemLogicData({ editingItemId, onSuccess }: { editingItemId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const deleteItemMutation = createMutation({
    mutationFn: () => deleteItemService({ itemId: editingItemId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.deleteItem'),
  });

  return { deleteItemMutation };
}

@Component({
  selector: 'app-delete-item-logic',
  imports: [FormButton, TranslatePipe],
  template: `
    @let isPending = logicData().deleteItemMutation.isPending();

    <div class="flex flex-col gap-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'items.delete.confirm' | t: { code: itemCode() } }}
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
          (click)="logicData().deleteItemMutation.mutate()"
        >
          {{ 'common.actions.delete' | t }}
        </button>
      </div>
    </div>
  `,
})
export class DeleteItemLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectDeleteItemLogicData>>();
  readonly itemCode = input.required<string>();
  readonly cancel = output<void>();
}
