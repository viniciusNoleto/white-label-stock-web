import { Component, computed, inject, input, output, type Signal, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
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
import type { IInventoryItem } from '../models/InventoryItem';
import { updateInventoryItemQuantityService } from '../services/updateInventoryItemQuantity';

export function injectUpdateQuantityLogicData({ editingItemId, onSuccess }: { editingItemId: Signal<number | undefined>; onSuccess: () => void }) {
  const i18n = inject(I18n);
  const notify = injectNotify();

  const currentQuantity = signal(0);

  const updateQuantitySchema = computed(() => yup.object({
    mode: yup.mixed<EQuantityMode>().oneOf(Object.values(EQuantityMode)).default(EQuantityMode.SET).required(),
    amount: yup.number()
      .nullable()
      .default(0)
      .required(i18n.t('forms.updateQuantity.validation.required'))
      .min(0, i18n.t('forms.updateQuantity.validation.min'))
      .when('mode', {
        is: EQuantityMode.SUBTRACT,
        then: (schema) => schema.max(currentQuantity(), i18n.t('forms.updateQuantity.validation.min')),
      }),
  }));

  const updateQuantityValidatedFormState = validatedFormState(updateQuantitySchema);

  function computeQuantity(mode: EQuantityMode, amount: number) {
    if (mode === EQuantityMode.ADD) return currentQuantity() + amount;
    if (mode === EQuantityMode.SUBTRACT) return Math.max(0, currentQuantity() - amount);
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

      return updateInventoryItemQuantityService({ itemId: editingItemId()!, body });
    },
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateQuantity'),
  });

  function updateQuantityInit(item: IInventoryItem) {
    currentQuantity.set(Number(item.quantity));
    updateQuantityValidatedFormState.reset({ mode: EQuantityMode.SET, amount: Number(item.quantity) });
  }

  return { updateQuantityValidatedFormState, updateQuantityMutation, updateQuantityInit, currentQuantity: currentQuantity.asReadonly(), computeQuantity };
}

@Component({
  selector: 'app-update-quantity-logic',
  imports: [Form, FormField, FormNumberInput, FormSegmentedControl, FormButton, TranslatePipe],
  template: `
    @let form = logicData().updateQuantityValidatedFormState;

    @let isPending = logicData().updateQuantityMutation.isPending();

    @let mode = form.state().mode;

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updateQuantity()"
    >
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'forms.updateQuantity.description' | t: { name: itemName() } }}
      </p>

      <app-form-segmented-control
        [data]="[
          { value: modes.SET, label: 'forms.updateQuantity.mode.set' | t },
          { value: modes.ADD, label: 'forms.updateQuantity.mode.add' | t },
          { value: modes.SUBTRACT, label: 'forms.updateQuantity.mode.subtract' | t },
        ]"
        [value]="mode"
        (valueChange)="changeMode($any($event))"
      />

      <app-form-number-input
        [minValue]="0"
        [label]="(mode === modes.SET ? 'forms.updateQuantity.quantity.label' : 'forms.updateQuantity.amount.label') | t"
        [placeholder]="(mode === modes.SET ? 'forms.updateQuantity.quantity.placeholder' : 'forms.updateQuantity.amount.placeholder') | t"
        [formField]="form.field.amount"
        withAsterisk
      />

      <p
        class="text-xs text-gray-500 dark:text-gray-400"
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
export class UpdateQuantityLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateQuantityLogicData>>();
  readonly itemName = input.required<string>();
  readonly cancel = output<void>();

  protected readonly modes = EQuantityMode;

  protected changeMode(mode: EQuantityMode) {
    const { updateQuantityValidatedFormState, currentQuantity } = this.logicData();

    updateQuantityValidatedFormState.setState({ mode, amount: mode === EQuantityMode.SET ? currentQuantity() : 0 });
  }

  protected updateQuantity() {
    const { updateQuantityValidatedFormState, updateQuantityMutation } = this.logicData();

    if (!updateQuantityValidatedFormState.validate()) return;

    updateQuantityMutation.mutate();
  }
}
