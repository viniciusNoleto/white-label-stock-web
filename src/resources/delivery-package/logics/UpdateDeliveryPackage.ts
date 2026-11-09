import { Component, computed, input, output, type Signal, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/Textarea';
import { getProductsService } from '@/resources/product/services/getProducts';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation, createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { type DeliveryPackageItemEntry, DeliveryPackageItemsField, deliveryPackageItemsError } from '../components/DeliveryPackageItemsField';
import type { IDeliveryPackage } from '../models/DeliveryPackage';
import { injectDeliveryPackageSchema } from '../schemas/deliveryPackage';
import { updateDeliveryPackageService } from '../services/updateDeliveryPackage';

export function injectUpdateDeliveryPackageLogicData({ editingPackageId, onSuccess }: { editingPackageId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const updatePackageValidatedFormState = validatedFormState(injectDeliveryPackageSchema());

  const updatePackageItems = signal<DeliveryPackageItemEntry[]>([]);
  const updatePackageShowItemErrors = signal(false);
  /** O que o pacote já separou antes da edição: conta como livre para ele mesmo. */
  const updatePackageOwnQuantities = signal<Record<number, number>>({});

  const updatePackageMutation = createMutation({
    mutationFn: () => updateDeliveryPackageService({
      packageId: editingPackageId()!,
      body: {
        notes: updatePackageValidatedFormState.state().notes.trim() || null,
        items: updatePackageItems().map((entry) => ({ product_id: entry.id, quantity: entry.quantity ?? 0 })),
      },
    }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateDeliveryPackage'),
  });

  function updatePackageInit(deliveryPackage: IDeliveryPackage) {
    updatePackageValidatedFormState.reset({ notes: deliveryPackage.notes ?? '' });
    updatePackageItems.set(deliveryPackage.items.map((item) => ({
      id: item.product_id,
      name: item.name,
      isAtomic: item.is_atomic,
      unitAbbreviation: item.unit.abbreviation,
      quantity: Number(item.quantity),
    })));
    updatePackageOwnQuantities.set(Object.fromEntries(deliveryPackage.items.map((item) => [item.product_id, Number(item.quantity)])));
    updatePackageShowItemErrors.set(false);
  }

  /** Valida anotações e itens (mostra os erros) e diz se pode enviar. */
  function updatePackageValidate() {
    updatePackageShowItemErrors.set(true);

    const formValid = updatePackageValidatedFormState.validate();

    return formValid && !deliveryPackageItemsError(updatePackageItems());
  }

  return {
    updatePackageValidatedFormState,
    updatePackageItems,
    updatePackageShowItemErrors,
    updatePackageOwnQuantities,
    updatePackageMutation,
    updatePackageInit,
    updatePackageValidate,
  };
}

@Component({
  selector: 'app-update-delivery-package-logic',
  imports: [Form, FormField, FormTextarea, FormButton, DeliveryPackageItemsField, TranslatePipe],
  template: `
    @let form = logicData().updatePackageValidatedFormState;

    @let isPending = logicData().updatePackageMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updatePackage()"
    >
      <div class="form-grid">
        <app-delivery-package-items-field
          class="col-span-12"
          [stockItems]="stockItems()"
          [ownQuantities]="logicData().updatePackageOwnQuantities()"
          [showErrors]="logicData().updatePackageShowItemErrors()"
          [(items)]="logicData().updatePackageItems"
        />

        <app-form-textarea
          class="col-span-12"
          [rows]="5"
          [label]="'forms.deliveryPackage.notes.label' | t"
          [placeholder]="'forms.deliveryPackage.notes.placeholder' | t"
          [formField]="form.field.notes"
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
export class UpdateDeliveryPackageLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateDeliveryPackageLogicData>>();
  readonly cancel = output<void>();

  private readonly stockQuery = createQuery({ queryFn: () => getProductsService({ query: { per_page: 100 } }) });

  protected readonly stockItems = computed(() => this.stockQuery.data()?.data.items ?? []);

  protected updatePackage() {
    const { updatePackageValidate, updatePackageMutation } = this.logicData();

    if (!updatePackageValidate()) return;

    updatePackageMutation.mutate();
  }
}
