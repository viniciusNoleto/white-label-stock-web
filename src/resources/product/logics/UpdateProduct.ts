import { Component, input, output, type Signal, signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { ProductFormFields } from '../components/ProductFormFields';
import { type ProductRecipeEntry, productRecipeError } from '../components/ProductRecipeField';
import type { IProduct } from '../models/Product';
import { injectProductSchema, productFormValues, productPayload, productRecipeEntries } from '../schemas/product';
import { updateProductService } from '../services/updateProduct';

export function injectUpdateProductLogicData({ editingProductId, onSuccess }: { editingProductId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const updateProductValidatedFormState = validatedFormState(injectProductSchema());

  const updateProductRecipe = signal<ProductRecipeEntry[]>([]);
  const updateProductShowRecipeErrors = signal(false);
  /** Com itens no estoque, atômico ↔ a granel fica travado (a API também recusa). */
  const updateProductModeLocked = signal(false);

  const updateProductMutation = createMutation({
    mutationFn: () => updateProductService({
      productId: editingProductId()!,
      body: productPayload(updateProductValidatedFormState.state(), updateProductRecipe()),
    }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateProduct'),
  });

  function updateProductInit(product: IProduct) {
    updateProductValidatedFormState.reset(productFormValues(product));
    updateProductRecipe.set(productRecipeEntries(product));
    updateProductModeLocked.set(product.items_count > 0);
    updateProductShowRecipeErrors.set(false);
  }

  function updateProductValidate() {
    updateProductShowRecipeErrors.set(true);

    const formValid = updateProductValidatedFormState.validate();

    return formValid && !productRecipeError(updateProductRecipe());
  }

  return {
    updateProductValidatedFormState,
    updateProductRecipe,
    updateProductShowRecipeErrors,
    updateProductModeLocked: updateProductModeLocked.asReadonly(),
    updateProductMutation,
    updateProductInit,
    updateProductValidate,
  };
}

@Component({
  selector: 'app-update-product-logic',
  imports: [Form, FormButton, ProductFormFields, TranslatePipe],
  template: `
    @let isPending = logicData().updateProductMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updateProduct()"
    >
      <app-product-form-fields
        [form]="logicData().updateProductValidatedFormState"
        [productId]="productId()"
        [modeLocked]="logicData().updateProductModeLocked()"
        [showRecipeErrors]="logicData().updateProductShowRecipeErrors()"
        [(recipe)]="logicData().updateProductRecipe"
      />

      <div class="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
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
export class UpdateProductLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateProductLogicData>>();
  readonly productId = input.required<number>();
  readonly cancel = output<void>();

  protected updateProduct() {
    const { updateProductValidate, updateProductMutation } = this.logicData();

    if (!updateProductValidate()) return;

    updateProductMutation.mutate();
  }
}
