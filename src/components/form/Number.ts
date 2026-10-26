import { Component, input, model } from '@angular/core';
import { HlmInput } from '@spartan-ng/helm/input';
import { FormFieldWrapper } from './FieldWrapper';
import { FormControlBase } from './types';

/**
 * `value` é sempre `number | null` (campo vazio = `null`) — nunca string.
 */
@Component({
  selector: 'app-form-number-input',
  imports: [FormFieldWrapper, HlmInput],
  host: { class: 'block' },
  template: `
    <app-form-field-wrapper
      [label]="label()"
      [description]="description()"
      [error]="errorMessage()"
      [controlId]="inputId()"
      [invalid]="showError()"
      [withAsterisk]="withAsterisk()"
    >
      <input
        hlmInput
        type="number"
        inputmode="decimal"
        [id]="inputId()"
        [attr.min]="minValue()"
        [attr.max]="maxValue()"
        [attr.step]="step()"
        [attr.aria-label]="ariaLabel()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [forceInvalid]="showError()"
        [attr.aria-invalid]="showError() || null"
        [value]="value() ?? ''"
        (input)="onInput($any($event.target).value)"
        (blur)="touch.emit()"
      />
    </app-form-field-wrapper>
  `,
})
export class FormNumberInput extends FormControlBase<number | null> {
  readonly value = model<number | null>(null);

  readonly minValue = input<number>();
  readonly maxValue = input<number>();
  readonly step = input<number | 'any'>('any');
  readonly ariaLabel = input<string>();

  protected onInput(raw: string) {
    const parsed = raw === '' ? null : Number(raw);
    this.value.set(parsed === null || Number.isNaN(parsed) ? null : parsed);
  }
}
