import { Component, input, output, type Signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { deleteUserService } from '../services/deleteUser';

export function injectDeleteUserLogicData({ editingUserId, onSuccess }: { editingUserId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const deleteUserMutation = createMutation({
    mutationFn: () => deleteUserService({ userId: editingUserId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.deleteUser'),
  });

  return { deleteUserMutation };
}

@Component({
  selector: 'app-delete-user-logic',
  imports: [FormButton, TranslatePipe],
  template: `
    @let isPending = logicData().deleteUserMutation.isPending();

    <div class="flex flex-col gap-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'users.delete.confirm' | t: { name: userName() } }}
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
          (click)="logicData().deleteUserMutation.mutate()"
        >
          {{ 'common.actions.delete' | t }}
        </button>
      </div>
    </div>
  `,
})
export class DeleteUserLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectDeleteUserLogicData>>();
  readonly userName = input.required<string>();
  readonly cancel = output<void>();
}
