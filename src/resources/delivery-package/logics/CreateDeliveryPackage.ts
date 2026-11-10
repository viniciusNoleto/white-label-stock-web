import { Component, computed, input, output, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/Textarea';
import { getProductsService } from '@/resources/product/services/getProducts';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation, createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { type DeliveryPackageItemEntry, DeliveryPackageItemsField, deliveryPackageItemsError, deliveryPackageItemsPayload } from '../components/DeliveryPackageItemsField';
import { injectDeliveryPackageSchema } from '../schemas/deliveryPackage';
import { createDeliveryPackageService } from '../services/createDeliveryPackage';
import { MAX_PER_PAGE } from '@/shared/constants/pagination';

export function injectCreateDeliveryPackageLogicData({ onSuccess }: { onSuccess: () => void }) {
  const notify = injectNotify();

  const createPackageValidatedFormState = validatedFormState(injectDeliveryPackageSchema());

  const createPackageItems = signal<DeliveryPackageItemEntry[]>([]);
  const createPackageShowItemErrors = signal(false);

  const createPackageMutation = createMutation({
    mutationFn: () => createDeliveryPackageService({
      body: {
        notes: createPackageValidatedFormState.state().notes.trim() || null,
        items: deliveryPackageItemsPayload(createPackageItems()),
      },
    }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.createDeliveryPackage'),
  });

  function createPackageReset() {
    createPackageValidatedFormState.reset();
    createPackageItems.set([]);
    createPackageShowItemErrors.set(false);
  }

  /** Valida anotações e itens (mostra os erros) e diz se pode enviar. */
  function createPackageValidate() {
    createPackageShowItemErrors.set(true);

    const formValid = createPackageValidatedFormState.validate();

    return formValid && !deliveryPackageItemsError(createPackageItems());
  }

  return {
    createPackageValidatedFormState,
    createPackageItems,
    createPackageShowItemErrors,
    createPackageMutation,
    createPackageReset,
    createPackageValidate,
  };
}

@Component({
  selector: 'app-create-delivery-package-logic',
  imports: [Form, FormField, FormTextarea, FormButton, DeliveryPackageItemsField, TranslatePipe],
  template: `
    @let form = logicData().createPackageValidatedFormState;

    @let isPending = logicData().createPackageMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="createPackage()"
    >
      <div class="form-grid">
        <app-delivery-package-items-field
          class="col-span-12"
          [stockItems]="stockItems()"
          [showErrors]="logicData().createPackageShowItemErrors()"
          [(items)]="logicData().createPackageItems"
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
export class CreateDeliveryPackageLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectCreateDeliveryPackageLogicData>>();
  readonly cancel = output<void>();

  private readonly stockQuery = createQuery({ queryFn: () => getProductsService({ query: { per_page: MAX_PER_PAGE } }) });

  protected readonly stockItems = computed(() => this.stockQuery.data()?.data.items ?? []);

  protected createPackage() {
    const { createPackageValidate, createPackageMutation } = this.logicData();

    if (!createPackageValidate()) return;

    createPackageMutation.mutate();
  }
}
