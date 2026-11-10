import { Component, computed, inject, input, output, type Signal, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { NgIcon } from '@ng-icons/core';
import * as yup from 'yup';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormNumberInput } from '@/components/form/Number';
import { FormSegmentedControl } from '@/components/form/SegmentedControl';
import { I18n } from '@/libs/i18n';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { EQuantityMode } from '../enums/QuantityMode';
import type { IItem } from '../models/Item';
import { updateItemQuantityService } from '../services/updateItemQuantity';

/** Campo vazio: o schema acusa o obrigatório no submit. */
const EMPTY_AMOUNT = null as unknown as number;

export function injectUpdateItemQuantityLogicData({ editingItemId, onSuccess }: { editingItemId: Signal<number | undefined>; onSuccess: () => void }) {
  const i18n = inject(I18n);
  const notify = injectNotify();

  const currentQuantity = signal(0);

  const updateQuantitySchema = computed(() => yup.object({
    // Somar é o padrão: é a operação segura com várias pessoas mexendo no mesmo lote.
    mode: yup.mixed<EQuantityMode>().oneOf(Object.values(EQuantityMode)).default(EQuantityMode.ADD).required(),
    // Definir aceita 0; somar/subtrair precisam de valor positivo, e a subtração
    // não passa do estoque atual (a API também recusa e devolve 422).
    amount: yup.number()
      .nullable()
      .default(null)
      .required(i18n.t('forms.updateQuantity.validation.required'))
      .min(0, i18n.t('forms.updateQuantity.validation.min'))
      .when('mode', {
        is: (mode: EQuantityMode) => mode !== EQuantityMode.SET,
        then: (schema) => schema.moreThan(0, i18n.t('forms.updateQuantity.validation.positive')),
      })
      .when('mode', {
        is: EQuantityMode.SUBTRACT,
        then: (schema) => schema.max(currentQuantity(), i18n.t('forms.updateQuantity.validation.max', { count: currentQuantity() })),
      }),
  }));

  const updateQuantityValidatedFormState = validatedFormState(updateQuantitySchema);

  function computeQuantity(mode: EQuantityMode, amount: number) {
    if (mode === EQuantityMode.ADD) return currentQuantity() + amount;
    if (mode === EQuantityMode.SUBTRACT) return currentQuantity() - amount;
    return amount;
  }

  const updateQuantityMutation = createMutation({
    // Somar/subtrair vão como operação relativa: a API aplica sobre o valor
    // atual do banco, sem perder alterações feitas por outra pessoa no meio.
    mutationFn: () => {
      const { mode, amount } = updateQuantityValidatedFormState.state();
      const value = amount ?? 0;

      const body = mode === EQuantityMode.ADD
        ? { quantity_add: value }
        : mode === EQuantityMode.SUBTRACT
          ? { quantity_subtract: value }
          : { quantity: value };

      return updateItemQuantityService({ itemId: editingItemId()!, body });
    },
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateQuantity'),
  });

  function updateQuantityInit(item: Pick<IItem, 'quantity'>) {
    currentQuantity.set(Number(item.quantity));
    updateQuantityValidatedFormState.reset({ mode: EQuantityMode.ADD, amount: EMPTY_AMOUNT });
  }

  return { updateQuantityValidatedFormState, updateQuantityMutation, updateQuantityInit, currentQuantity: currentQuantity.asReadonly(), computeQuantity };
}

@Component({
  selector: 'app-update-item-quantity-logic',
  imports: [Form, FormField, NgIcon, FormNumberInput, FormSegmentedControl, FormButton, TranslatePipe],
  template: `
    @let form = logicData().updateQuantityValidatedFormState;

    @let isPending = logicData().updateQuantityMutation.isPending();

    @let mode = form.state().mode;

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updateQuantity()"
    >
      <div class="flex flex-col gap-1">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ 'forms.updateQuantity.description.' + mode | t: { name: itemName() } }}
        </p>

        <p class="text-sm font-medium tabular-nums">
          {{ 'forms.updateQuantity.current' | t: { count: logicData().currentQuantity() } }}
        </p>
      </div>

      <app-form-segmented-control
        [data]="[
          { value: modes.ADD, label: 'forms.updateQuantity.mode.add' | t },
          { value: modes.SUBTRACT, label: 'forms.updateQuantity.mode.subtract' | t },
          { value: modes.SET, label: 'forms.updateQuantity.mode.set' | t },
        ]"
        [value]="mode"
        (valueChange)="changeMode($any($event))"
      />

      @if (mode === modes.SET) {
        <div
          role="alert"
          class="flex gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
        >
          <ng-icon
            name="lucideTriangleAlert"
            size="18"
            class="mt-0.5 shrink-0"
          />

          <div class="flex flex-col gap-1.5">
            <p class="font-medium">
              {{ 'forms.updateQuantity.setWarning.title' | t }}
            </p>

            <p>
              {{ 'forms.updateQuantity.setWarning.body' | t }}
            </p>

            <p>
              {{ 'forms.updateQuantity.setWarning.advice' | t }}
            </p>
          </div>
        </div>
      }

      <app-form-number-input
        [minValue]="0"
        [label]="(mode === modes.SET ? 'forms.updateQuantity.quantity.label' : 'forms.updateQuantity.amount.label') | t"
        [placeholder]="(mode === modes.SET ? 'forms.updateQuantity.quantity.placeholder' : 'forms.updateQuantity.amount.placeholder') | t"
        [formField]="form.field.amount"
        withAsterisk
      />

      <p
        class="text-sm text-gray-600 dark:text-gray-300"
        aria-live="polite"
      >
        {{ 'forms.updateQuantity.preview' | t: { count: logicData().computeQuantity(mode, form.state().amount || 0) } }}
      </p>

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
export class UpdateItemQuantityLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateItemQuantityLogicData>>();
  readonly itemName = input.required<string>();
  readonly cancel = output<void>();

  protected readonly modes = EQuantityMode;

  protected changeMode(mode: EQuantityMode) {
    const { updateQuantityValidatedFormState, currentQuantity } = this.logicData();

    updateQuantityValidatedFormState.setState({ mode, amount: mode === EQuantityMode.SET ? currentQuantity() : EMPTY_AMOUNT });
  }

  protected updateQuantity() {
    const { updateQuantityValidatedFormState, updateQuantityMutation } = this.logicData();

    if (!updateQuantityValidatedFormState.validate()) return;

    updateQuantityMutation.mutate();
  }
}
