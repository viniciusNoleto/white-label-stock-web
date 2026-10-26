import { Component, input, output, type Signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormTextInput } from '@/components/form/TextInput';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IUnit } from '../models/Unit';
import { injectUnitSchema } from '../schemas/unit';
import { updateUnitService } from '../services/updateUnit';

export function injectUpdateUnitLogicData({ editingUnitId, onSuccess }: { editingUnitId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const updateUnitValidatedFormState = validatedFormState(injectUnitSchema());

  const updateUnitMutation = createMutation({
    mutationFn: () => updateUnitService({ unitId: editingUnitId()!, body: updateUnitValidatedFormState.state() }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateUnit'),
  });

  function updateUnitInit(unit: IUnit) {
    updateUnitValidatedFormState.reset({ name: unit.name, abbreviation: unit.abbreviation });
  }

  return { updateUnitValidatedFormState, updateUnitMutation, updateUnitInit };
}

@Component({
  selector: 'app-update-unit-logic',
  imports: [Form, FormField, FormTextInput, FormButton, TranslatePipe],
  template: `
    @let form = logicData().updateUnitValidatedFormState;

    @let isPending = logicData().updateUnitMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updateUnit()"
    >
      <div class="form-grid">
        <app-form-text-input
          class="col-span-12"
          [label]="'forms.unit.name.label' | t"
          [placeholder]="'forms.unit.name.placeholder' | t"
          [formField]="form.field.name"
          withAsterisk
        />

        <app-form-text-input
          class="col-span-12"
          [label]="'forms.unit.abbreviation.label' | t"
          [placeholder]="'forms.unit.abbreviation.placeholder' | t"
          [formField]="form.field.abbreviation"
          withAsterisk
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
export class UpdateUnitLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateUnitLogicData>>();
  readonly cancel = output<void>();

  protected updateUnit() {
    const { updateUnitValidatedFormState, updateUnitMutation } = this.logicData();

    if (!updateUnitValidatedFormState.validate()) return;

    updateUnitMutation.mutate();
  }
}
