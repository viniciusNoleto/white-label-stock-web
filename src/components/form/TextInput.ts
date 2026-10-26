import { Component, input, model } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmInput } from '@spartan-ng/helm/input';
import { FormFieldWrapper } from './FieldWrapper';
import { FormControlBase } from './types';

@Component({
  selector: 'app-form-text-input',
  imports: [FormFieldWrapper, HlmInput, NgIcon],
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
      <div class="relative">
        @if (leftIcon()) {
          <ng-icon
            [name]="leftIcon()!"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
        }

        <input
          hlmInput
          [id]="inputId()"
          [type]="type()"
          [attr.autocomplete]="autocomplete()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [forceInvalid]="showError()"
          [attr.aria-invalid]="showError() || null"
          [class.pl-8]="!!leftIcon()"
          [value]="value()"
          (input)="value.set($any($event.target).value)"
          (blur)="touch.emit()"
        />
      </div>
    </app-form-field-wrapper>
  `,
})
export class FormTextInput extends FormControlBase<string> {
  readonly value = model<string>('');

  readonly type = input<'text' | 'email' | 'search' | 'url' | 'tel'>('text');
  readonly autocomplete = input<string>();
  readonly leftIcon = input<string>();
}
