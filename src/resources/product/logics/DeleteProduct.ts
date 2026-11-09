import { Component, input, output, type Signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { deleteProductService } from '../services/deleteProduct';

export function injectDeleteProductLogicData({ editingProductId, onSuccess }: { editingProductId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const deleteProductMutation = createMutation({
    mutationFn: () => deleteProductService({ productId: editingProductId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.deleteProduct'),
  });

  return { deleteProductMutation };
}

@Component({
  selector: 'app-delete-product-logic',
  imports: [FormButton, TranslatePipe],
  template: `
    @let isPending = logicData().deleteProductMutation.isPending();

    <div class="flex flex-col gap-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'products.delete.confirm' | t: { name: productName() } }}
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
          (click)="logicData().deleteProductMutation.mutate()"
        >
          {{ 'common.actions.delete' | t }}
        </button>
      </div>
    </div>
  `,
})
export class DeleteProductLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectDeleteProductLogicData>>();
  readonly productName = input.required<string>();
  readonly cancel = output<void>();
}
