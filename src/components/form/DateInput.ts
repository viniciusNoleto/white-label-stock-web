import { Component, input, model } from '@angular/core';
import { HlmInput } from '@spartan-ng/helm/input';
import { FormFieldWrapper } from './FieldWrapper';
import { FormControlBase } from './types';

/**
 * Data sem hora. `value` é sempre `YYYY-MM-DD` ou `''` (vazio) — o mesmo formato que a API usa.
 */
@Component({
  selector: 'app-form-date-input',
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
        type="date"
        [id]="inputId()"
        [attr.min]="minDate()"
        [attr.max]="maxDate()"
        [disabled]="disabled()"
        [forceInvalid]="showError()"
        [attr.aria-invalid]="showError() || null"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        (blur)="touch.emit()"
      />
    </app-form-field-wrapper>
  `,
})
export class FormDateInput extends FormControlBase<string> {
  readonly value = model<string>('');

  readonly minDate = input<string>();
  readonly maxDate = input<string>();
}
