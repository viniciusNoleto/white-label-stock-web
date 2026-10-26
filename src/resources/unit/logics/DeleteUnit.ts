import { Component, input, output, type Signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { deleteUnitService } from '../services/deleteUnit';

export function injectDeleteUnitLogicData({ editingUnitId, onSuccess }: { editingUnitId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const deleteUnitMutation = createMutation({
    mutationFn: () => deleteUnitService({ unitId: editingUnitId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.deleteUnit'),
  });

  return { deleteUnitMutation };
}

@Component({
  selector: 'app-delete-unit-logic',
  imports: [FormButton, TranslatePipe],
  template: `
    @let isPending = logicData().deleteUnitMutation.isPending();

    <div class="flex flex-col gap-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'units.delete.confirm' | t: { name: unitName() } }}
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
          (click)="logicData().deleteUnitMutation.mutate()"
        >
          {{ 'common.actions.delete' | t }}
        </button>
      </div>
    </div>
  `,
})
export class DeleteUnitLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectDeleteUnitLogicData>>();
  readonly unitName = input.required<string>();
  readonly cancel = output<void>();
}
