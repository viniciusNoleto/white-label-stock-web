import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import * as yup from 'yup';
import { FormButton } from '@/components/form/Button';
import { FormDateInput } from '@/components/form/DateInput';
import { Form } from '@/components/form/Form';
import { FormNumberInput } from '@/components/form/Number';
import { FormSelect } from '@/components/form/Select';
import { FormSwitch } from '@/components/form/Switch';
import { FormTextInput } from '@/components/form/TextInput';
import { I18n } from '@/libs/i18n';
import { freeStock, type IProduct, itemCodeExample, maxProducible } from '@/resources/product/models/Product';
import { getProductsService } from '@/resources/product/services/getProducts';
import { getStoragesService } from '@/resources/storage/services/getStorages';
import { addDaysISO, formatISODate, todayISO } from '@/utils/date';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation, createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { createItemsService } from '../services/createItems';

/** Mesmo limite da API (`CreateItemsAction::MAX_BATCH`). */
export const MAX_ITEMS_BATCH = 500;

/**
 * Gera itens de um produto: atômico → `quantity` itens de uma vez (produção em lote, cada um com
 * código); a granel → um lote com a quantidade. Com receita, pode consumir os componentes (FEFO).
 */
export function injectCreateItemsLogicData({ onSuccess }: { onSuccess: () => void }) {
  const i18n = inject(I18n);
  const notify = injectNotify();

  /** Produto escolhido no formulário (o componente mantém em dia a partir de `product_id`). */
  const createItemsProduct = signal<IProduct | null>(null);

  const createItemsSchema = computed(() => {
    const product = createItemsProduct();
    const max = product?.is_atomic ? MAX_ITEMS_BATCH : undefined;

    return yup.object({
      product_id: yup.number().nullable().default(null).required(i18n.t('forms.createItems.validation.productRequired')),
      quantity: yup.number()
        .nullable()
        .default(1)
        .required(i18n.t('forms.createItems.validation.quantityRequired'))
        .moreThan(0, i18n.t('forms.createItems.validation.quantityPositive'))
        .test('integer', i18n.t('forms.createItems.validation.integer'), (value) => !product?.is_atomic || value == null || Number.isInteger(value))
        .max(max ?? Number.MAX_SAFE_INTEGER, i18n.t('forms.createItems.validation.max', { count: MAX_ITEMS_BATCH })),
      produced_at: yup.string().default('').required(i18n.t('forms.createItems.validation.dateRequired')),
      storage_id: yup.number().nullable().default(null),
      code: yup.string().default('').trim().max(80),
      consume_components: yup.boolean().default(false),
    });
  });

  const createItemsValidatedFormState = validatedFormState(createItemsSchema);

  const createItemsMutation = createMutation({
    mutationFn: () => {
      const { product_id, quantity, produced_at, storage_id, code, consume_components } = createItemsValidatedFormState.state();
      const single = !createItemsProduct()?.is_atomic || quantity === 1;

      return createItemsService({
        body: {
          product_id: product_id!,
          quantity: quantity ?? 1,
          produced_at,
          storage_id,
          code: single ? code.trim() || null : null,
          consume_components: consume_components && !!createItemsProduct()?.components.length,
        },
      });
    },
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.createItems'),
  });

  /** Abre o formulário vazio ou já com um produto escolhido (vindo da tela de produtos/operação). */
  function createItemsReset(productId: number | null = null) {
    createItemsProduct.set(null);
    createItemsValidatedFormState.reset({
      // `null` = ainda não escolhido; o schema acusa o obrigatório no submit.
      product_id: productId as number,
      quantity: 1,
      produced_at: todayISO(),
      storage_id: null,
      code: '',
      consume_components: false,
    });
  }

  return { createItemsValidatedFormState, createItemsMutation, createItemsReset, createItemsProduct };
}

@Component({
  selector: 'app-create-items-logic',
  imports: [Form, FormField, FormSelect, FormNumberInput, FormDateInput, FormTextInput, FormSwitch, FormButton, TranslatePipe],
  template: `
    @let form = logicData().createItemsValidatedFormState;

    @let isPending = logicData().createItemsMutation.isPending();

    @let product = logicData().createItemsProduct();

    @let quantity = form.state().quantity || 0;

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="createItems()"
    >
      <div class="form-grid">
        <app-form-select
          class="col-span-12"
          valueField="id"
          labelField="name"
          [label]="'forms.createItems.product.label' | t"
          [placeholder]="'forms.createItems.product.placeholder' | t"
          [data]="products()"
          [formField]="form.field.product_id"
          withAsterisk
        />

        <app-form-number-input
          class="col-span-12 sm:col-span-6"
          [minValue]="product?.is_atomic ? 1 : 0"
          [step]="product?.is_atomic ? 1 : 'any'"
          [label]="(product?.is_atomic === false ? 'forms.createItems.quantity.bulkLabel' : 'forms.createItems.quantity.atomicLabel') | t: { unit: product?.unit?.abbreviation ?? '' }"
          [description]="(product?.is_atomic === false ? 'forms.createItems.quantity.bulkDescription' : 'forms.createItems.quantity.atomicDescription') | t"
          [formField]="form.field.quantity"
          withAsterisk
        />

        <app-form-date-input
          class="col-span-12 sm:col-span-6"
          [label]="'forms.createItems.producedAt.label' | t"
          [description]="expirationHint()"
          [formField]="form.field.produced_at"
          withAsterisk
        />

        <app-form-select
          class="col-span-12 sm:col-span-6"
          valueField="id"
          labelField="name"
          [clearable]="true"
          [label]="'forms.createItems.storage.label' | t"
          [placeholder]="'forms.createItems.storage.placeholder' | t"
          [data]="storages()"
          [formField]="form.field.storage_id"
        />

        @if (!product?.is_atomic || quantity <= 1) {
          <app-form-text-input
            class="col-span-12 sm:col-span-6"
            [label]="'forms.createItems.code.label' | t"
            [placeholder]="'forms.createItems.code.placeholder' | t"
            [description]="product ? ('forms.createItems.code.description' | t: { example: codeExample() }) : undefined"
            [formField]="form.field.code"
          />
        } @else {
          <p class="col-span-12 self-end text-sm text-muted-foreground sm:col-span-6">
            {{ 'forms.createItems.code.batch' | t: { count: quantity, example: codeExample() } }}
          </p>
        }

        @if (product?.components?.length) {
          <div class="col-span-12 flex flex-col gap-3 border border-gray-200 p-4 dark:border-neutral-800">
            <app-form-switch
              [label]="'forms.createItems.consume.label' | t"
              [description]="'forms.createItems.consume.description' | t"
              [formField]="form.field.consume_components"
            />

            @if (form.state().consume_components) {
              <ul class="flex flex-col gap-1.5">
                @for (component of product!.components; track component.id) {
                  @let required = +component.quantity_required * quantity;

                  @let free = freeOf(component);

                  <li class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                    <span class="truncate">
                      {{ component.name }}
                    </span>

                    <span
                      class="font-mono text-xs tabular-nums"
                      [class]="free >= required ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'"
                    >
                      {{ 'forms.createItems.consume.line' | t: { required: round(required), free: round(free) } }}
                    </span>
                  </li>
                }
              </ul>

              <p class="text-sm font-medium">
                {{ 'forms.createItems.consume.max' | t: { count: maxProducible() } }}
              </p>
            }
          </div>
        }
      </div>

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
          leftIcon="lucidePackagePlus"
          [loading]="isPending"
        >
          {{ 'forms.createItems.submit' | t }}
        </button>
      </div>
    </form>
  `,
})
export class CreateItemsLogicComponent {
  private readonly i18n = inject(I18n);

  readonly logicData = input.required<ReturnType<typeof injectCreateItemsLogicData>>();
  readonly cancel = output<void>();

  private readonly productsQuery = createQuery({ queryFn: () => getProductsService({ query: { per_page: 100 } }) });
  private readonly storagesQuery = createQuery({ queryFn: () => getStoragesService() });

  protected readonly products = computed(() => this.productsQuery.data()?.data.items ?? []);
  protected readonly storages = computed(() => this.storagesQuery.data()?.data ?? []);

  protected readonly codeExample = computed(() => {
    const product = this.logicData().createItemsProduct();
    return product ? itemCodeExample(product) : '';
  });

  protected readonly maxProducible = computed(() => {
    const product = this.logicData().createItemsProduct();
    return product ? (maxProducible(product) ?? 0) : 0;
  });

  protected readonly expirationHint = computed(() => {
    const product = this.logicData().createItemsProduct();
    const producedAt = this.logicData().createItemsValidatedFormState.state().produced_at;

    if (!product) return undefined;

    if (!product.shelf_life_days) return this.i18n.t('forms.createItems.producedAt.noExpiration');

    if (!producedAt) return undefined;

    return this.i18n.t('forms.createItems.producedAt.expiresOn', {
      date: formatISODate(addDaysISO(producedAt, product.shelf_life_days), this.i18n.language()),
      count: product.shelf_life_days,
    });
  });

  constructor() {
    // Mantém o produto escolhido (e o padrão de consumir a receita) em dia com o select.
    effect(() => {
      const productId = this.logicData().createItemsValidatedFormState.state().product_id;
      const product = this.products().find((candidate) => candidate.id === productId) ?? null;

      untracked(() => {
        const { createItemsProduct, createItemsValidatedFormState } = this.logicData();
        const previous = createItemsProduct();

        // A lista recarregada traz o estoque atualizado; só a troca de produto mexe no consumo.
        if (product && previous?.id !== product.id) {
          createItemsValidatedFormState.setValue('consume_components', product.components.length > 0);
        }

        if (product || productId === null) createItemsProduct.set(product);
      });
    });
  }

  protected freeOf(component: IProduct['components'][number]) {
    return freeStock(component);
  }

  protected round(value: number) {
    return Math.round(value * 10_000) / 10_000;
  }

  protected createItems() {
    const { createItemsValidatedFormState, createItemsMutation } = this.logicData();

    if (!createItemsValidatedFormState.validate()) return;

    createItemsMutation.mutate();
  }
}
