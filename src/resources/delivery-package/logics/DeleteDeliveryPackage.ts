import { Component, input, output, type Signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IDeliveryPackage } from '../models/DeliveryPackage';
import { deleteDeliveryPackageService } from '../services/deleteDeliveryPackage';

export function injectDeleteDeliveryPackageLogicData({ editingPackageId, onSuccess }: { editingPackageId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const deletePackageMutation = createMutation({
    mutationFn: () => deleteDeliveryPackageService({ packageId: editingPackageId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.deleteDeliveryPackage'),
  });

  return { deletePackageMutation };
}

/**
 * Desfazer pacote pendente: libera os itens reservados, sem mexer no estoque. Pacote entregue é o
 * registro da saída e a API recusa a exclusão (422), por isso a página nem oferece a ação.
 */
@Component({
  selector: 'app-delete-delivery-package-logic',
  imports: [FormButton, TranslatePipe],
  template: `
    @let isPending = logicData().deletePackageMutation.isPending();

    <div class="flex flex-col gap-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'deliveries.delete.confirmPending' | t: { id: deliveryPackage().id } }}
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
          (click)="logicData().deletePackageMutation.mutate()"
        >
          {{ 'deliveries.delete.submit' | t }}
        </button>
      </div>
    </div>
  `,
})
export class DeleteDeliveryPackageLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectDeleteDeliveryPackageLogicData>>();
  readonly deliveryPackage = input.required<IDeliveryPackage>();
  readonly cancel = output<void>();
}
