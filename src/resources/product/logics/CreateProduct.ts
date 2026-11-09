import { Component, input, output, signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { ProductFormFields } from '../components/ProductFormFields';
import { type ProductRecipeEntry, productRecipeError } from '../components/ProductRecipeField';
import { injectProductSchema, productPayload } from '../schemas/product';
import { createProductService } from '../services/createProduct';

export function injectCreateProductLogicData({ onSuccess }: { onSuccess: () => void }) {
  const notify = injectNotify();

  const createProductValidatedFormState = validatedFormState(injectProductSchema());

  const createProductRecipe = signal<ProductRecipeEntry[]>([]);
  const createProductShowRecipeErrors = signal(false);

  const createProductMutation = createMutation({
    mutationFn: () => createProductService({ body: productPayload(createProductValidatedFormState.state(), createProductRecipe()) }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.createProduct'),
  });

  function createProductReset() {
    createProductValidatedFormState.reset();
    createProductRecipe.set([]);
    createProductShowRecipeErrors.set(false);
  }

  /** Valida campos e receita (mostra os erros) e diz se pode enviar. */
  function createProductValidate() {
    createProductShowRecipeErrors.set(true);

    const formValid = createProductValidatedFormState.validate();

    return formValid && !productRecipeError(createProductRecipe());
  }

  return {
    createProductValidatedFormState,
    createProductRecipe,
    createProductShowRecipeErrors,
    createProductMutation,
    createProductReset,
    createProductValidate,
  };
}

@Component({
  selector: 'app-create-product-logic',
  imports: [Form, FormButton, ProductFormFields, TranslatePipe],
  template: `
    @let isPending = logicData().createProductMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="createProduct()"
    >
      <app-product-form-fields
        [form]="logicData().createProductValidatedFormState"
        [showRecipeErrors]="logicData().createProductShowRecipeErrors()"
        [(recipe)]="logicData().createProductRecipe"
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
export class CreateProductLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectCreateProductLogicData>>();
  readonly cancel = output<void>();

  protected createProduct() {
    const { createProductValidate, createProductMutation } = this.logicData();

    if (!createProductValidate()) return;

    createProductMutation.mutate();
  }
}
