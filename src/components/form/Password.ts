import { Component, input, model, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmInput } from '@spartan-ng/helm/input';
import { TranslatePipe } from '@/utils/translate.pipe';
import { FormFieldWrapper } from './FieldWrapper';
import { FormControlBase } from './types';

@Component({
  selector: 'app-form-password',
  imports: [FormFieldWrapper, HlmInput, NgIcon, TranslatePipe],
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
        <input
          hlmInput
          class="pr-9"
          [id]="inputId()"
          [type]="visible() ? 'text' : 'password'"
          [attr.autocomplete]="autocomplete()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [forceInvalid]="showError()"
          [attr.aria-invalid]="showError() || null"
          [value]="value()"
          (input)="value.set($any($event.target).value)"
          (blur)="touch.emit()"
        />

        <button
          type="button"
          class="absolute right-1 top-1/2 -translate-y-1/2 center-flex size-7 rounded-md text-muted-foreground hover:bg-muted"
          [attr.aria-label]="(visible() ? 'forms.password.hide' : 'forms.password.show') | t"
          [attr.aria-pressed]="visible()"
          (click)="visible.set(!visible())"
        >
          <ng-icon [name]="visible() ? 'lucideEyeOff' : 'lucideEye'" />
        </button>
      </div>
    </app-form-field-wrapper>
  `,
})
export class FormPassword extends FormControlBase<string> {
  readonly value = model<string>('');

  readonly autocomplete = input<string>('current-password');

  protected readonly visible = signal(false);
}
