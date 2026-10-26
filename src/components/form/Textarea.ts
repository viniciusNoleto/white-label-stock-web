import { Component, input, model } from '@angular/core';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { FormFieldWrapper } from './FieldWrapper';
import { FormControlBase } from './types';

@Component({
  selector: 'app-form-textarea',
  imports: [FormFieldWrapper, HlmTextarea],
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
      <textarea
        hlmTextarea
        [id]="inputId()"
        [rows]="rows()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [forceInvalid]="showError()"
        [attr.aria-invalid]="showError() || null"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        (blur)="touch.emit()"
      ></textarea>
    </app-form-field-wrapper>
  `,
})
export class FormTextarea extends FormControlBase<string> {
  readonly value = model<string>('');

  readonly rows = input(3);
}
