import { Component, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormTextInput } from '@/components/form/TextInput';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { injectUnitSchema } from '../schemas/unit';
import { createUnitService } from '../services/createUnit';

export function injectCreateUnitLogicData({ onSuccess }: { onSuccess: () => void }) {
  const notify = injectNotify();

  const createUnitValidatedFormState = validatedFormState(injectUnitSchema());

  const createUnitMutation = createMutation({
    mutationFn: () => createUnitService({ body: createUnitValidatedFormState.state() }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.createUnit'),
  });

  function createUnitReset() {
    createUnitValidatedFormState.reset();
  }

  return { createUnitValidatedFormState, createUnitMutation, createUnitReset };
}

@Component({
  selector: 'app-create-unit-logic',
  imports: [Form, FormField, FormTextInput, FormButton, TranslatePipe],
  template: `
    @let form = logicData().createUnitValidatedFormState;

    @let isPending = logicData().createUnitMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="createUnit()"
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
export class CreateUnitLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectCreateUnitLogicData>>();
  readonly cancel = output<void>();

  protected createUnit() {
    const { createUnitValidatedFormState, createUnitMutation } = this.logicData();

    if (!createUnitValidatedFormState.validate()) return;

    createUnitMutation.mutate();
  }
}
