import { Component, computed, input, output, type Signal } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { FormButton } from '@/components/form/Button';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IDeliveryPackage } from '../models/DeliveryPackage';
import { deliverDeliveryPackageService } from '../services/deliverDeliveryPackage';

export function injectDeliverDeliveryPackageLogicData({ editingPackageId, onSuccess }: { editingPackageId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const deliverPackageMutation = createMutation({
    mutationFn: () => deliverDeliveryPackageService({ packageId: editingPackageId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.deliverDeliveryPackage'),
  });

  return { deliverPackageMutation };
}

/** Confirmação da entrega: mostra o que sai do estoque e avisa se algum item não tem o suficiente. */
@Component({
  selector: 'app-deliver-delivery-package-logic',
  imports: [FormButton, HlmBadge, TranslatePipe],
  template: `
    @let isPending = logicData().deliverPackageMutation.isPending();

    <div class="flex flex-col gap-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'deliveries.deliver.confirm' | t }}
      </p>

      <ul class="flex flex-col gap-1.5 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
        @for (item of deliveryPackage().items; track item.id) {
          @let enough = +item.current_quantity >= +item.quantity;

          <li class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
            <span class="truncate">
              {{ +item.quantity }} {{ item.unit.abbreviation }} · {{ item.name }}
            </span>

            <span
              hlmBadge
              [variant]="enough ? 'secondary' : 'destructive'"
            >
              {{ 'deliveries.deliver.inStock' | t: { count: +item.current_quantity } }}
            </span>
          </li>
        }
      </ul>

      @if (shortage()) {
        <p
          role="alert"
          class="text-sm text-destructive"
        >
          {{ 'deliveries.deliver.shortage' | t }}
        </p>
      }

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
          leftIcon="lucidePackageCheck"
          [disabled]="shortage()"
          [loading]="isPending"
          (click)="logicData().deliverPackageMutation.mutate()"
        >
          {{ 'deliveries.deliver.submit' | t }}
        </button>
      </div>
    </div>
  `,
})
export class DeliverDeliveryPackageLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectDeliverDeliveryPackageLogicData>>();
  readonly deliveryPackage = input.required<IDeliveryPackage>();
  readonly cancel = output<void>();

  protected readonly shortage = computed(() => this.deliveryPackage().items.some((item) => +item.current_quantity < +item.quantity));
}
