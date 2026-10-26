import { Component, input, output, type Signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { deleteStorageService } from '../services/deleteStorage';

export function injectDeleteStorageLogicData({ editingStorageId, onSuccess }: { editingStorageId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const deleteStorageMutation = createMutation({
    mutationFn: () => deleteStorageService({ storageId: editingStorageId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.deleteStorage'),
  });

  return { deleteStorageMutation };
}

@Component({
  selector: 'app-delete-storage-logic',
  imports: [FormButton, TranslatePipe],
  template: `
    @let isPending = logicData().deleteStorageMutation.isPending();

    <div class="flex flex-col gap-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'storages.delete.confirm' | t: { name: storageName() } }}
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
          (click)="logicData().deleteStorageMutation.mutate()"
        >
          {{ 'common.actions.delete' | t }}
        </button>
      </div>
    </div>
  `,
})
export class DeleteStorageLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectDeleteStorageLogicData>>();
  readonly storageName = input.required<string>();
  readonly cancel = output<void>();
}
