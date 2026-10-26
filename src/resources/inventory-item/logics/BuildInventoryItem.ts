import { Component, computed, inject, input, output, type Signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { HlmBadge } from '@spartan-ng/helm/badge';
import * as yup from 'yup';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormNumberInput } from '@/components/form/Number';
import { I18n } from '@/libs/i18n';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { type IInventoryItem, maxBuildableQuantity } from '../models/InventoryItem';
import { buildInventoryItemService } from '../services/buildInventoryItem';

export function injectBuildInventoryItemLogicData({ editingItemId, onSuccess }: { editingItemId: Signal<number | undefined>; onSuccess: () => void }) {
  const i18n = inject(I18n);
  const notify = injectNotify();

  const buildSchema = computed(() => yup.object({
    quantity: yup.number()
      .nullable()
      .default(1)
      .required(i18n.t('forms.build.validation.required'))
      .min(1, i18n.t('forms.build.validation.min')),
  }));

  const buildValidatedFormState = validatedFormState(buildSchema);

  const buildMutation = createMutation({
    mutationFn: () => buildInventoryItemService({ itemId: editingItemId()!, body: { quantity: buildValidatedFormState.state().quantity ?? 1 } }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.build'),
  });

  function buildReset() {
    buildValidatedFormState.reset();
  }

  return { buildValidatedFormState, buildMutation, buildReset };
}

@Component({
  selector: 'app-build-inventory-item-logic',
  imports: [Form, FormField, FormNumberInput, FormButton, HlmBadge, TranslatePipe],
  template: `
    @let form = logicData().buildValidatedFormState;

    @let isPending = logicData().buildMutation.isPending();

    @if (!item().components.length) {
      <div class="flex flex-col gap-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ 'forms.build.noComponentsMessage' | t }}
        </p>

        <div class="flex justify-end">
          <button
            appButton
            variant="ghost"
            (click)="cancel.emit()"
          >
            {{ 'common.actions.close' | t }}
          </button>
        </div>
      </div>
    } @else {
      <form
        appForm
        class="flex flex-col gap-6"
        (submitted)="build()"
      >
        <div class="flex flex-col gap-2">
          <span class="text-sm font-medium">
            {{ 'forms.build.requiredComponentsLabel' | t }}
          </span>

          <ul class="flex flex-col gap-1.5 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
            @for (component of item().components; track component.id) {
              @let required = +component.quantity_required * (form.state().quantity || 0);

              @let available = +component.current_quantity;

              <li class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                <span class="truncate">
                  {{ component.name }}
                </span>

                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-gray-500 dark:text-gray-400">
                    {{ 'forms.build.requiredLabel' | t: { count: required } }}
                  </span>

                  <span
                    hlmBadge
                    class="text-white"
                    [class.bg-emerald-600]="available >= required"
                    [class.bg-destructive]="available < required"
                  >
                    {{ 'forms.build.availableLabel' | t: { count: available } }}
                  </span>
                </div>
              </li>
            }
          </ul>
        </div>

        <div class="flex flex-col gap-1">
          <app-form-number-input
            [minValue]="1"
            [maxValue]="maxBuildable()"
            [step]="1"
            [label]="'forms.build.quantity.label' | t"
            [placeholder]="'forms.build.quantity.placeholder' | t"
            [formField]="form.field.quantity"
            withAsterisk
          />

          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ 'forms.build.maxPossibleLabel' | t: { count: maxBuildable() } }}
          </p>
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
            leftIcon="lucideHammer"
            [loading]="isPending"
            [disabled]="maxBuildable() === 0"
          >
            {{ 'forms.build.submit' | t }}
          </button>
        </div>
      </form>
    }
  `,
})
export class BuildInventoryItemLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectBuildInventoryItemLogicData>>();
  readonly item = input.required<IInventoryItem>();
  readonly cancel = output<void>();

  protected readonly maxBuildable = computed(() => maxBuildableQuantity(this.item()));

  protected build() {
    const { buildValidatedFormState, buildMutation } = this.logicData();

    if (!buildValidatedFormState.validate()) return;

    buildMutation.mutate();
  }
}
