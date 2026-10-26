import { Component, input, model } from '@angular/core';
import { HlmInput } from '@spartan-ng/helm/input';
import { PRIMARY_COLOR, SECONDARY_COLOR, TERTIARY_COLOR } from '@/shared/constants/colors';
import { TranslatePipe } from '@/utils/translate.pipe';
import { FormFieldWrapper } from './FieldWrapper';
import { FormControlBase } from './types';

export const DEFAULT_COLOR_SWATCHES = [PRIMARY_COLOR, SECONDARY_COLOR, TERTIARY_COLOR, '#E31E24', '#2ECC71', '#F39C12', '#E74C3C', '#1ABC9C'];

/**
 * Cor em hexadecimal (`#RRGGBB`): seletor nativo + campo de texto + amostras.
 */
@Component({
  selector: 'app-form-color-input',
  imports: [FormFieldWrapper, HlmInput, TranslatePipe],
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
      <div class="flex items-center gap-2">
        <input
          type="color"
          class="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-50"
          [attr.aria-label]="label()"
          [disabled]="disabled()"
          [value]="value() || '#000000'"
          (input)="value.set($any($event.target).value.toUpperCase())"
          (blur)="touch.emit()"
        />

        <input
          hlmInput
          class="font-mono uppercase"
          maxlength="7"
          [id]="inputId()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [forceInvalid]="showError()"
          [attr.aria-invalid]="showError() || null"
          [value]="value()"
          (input)="value.set($any($event.target).value.toUpperCase())"
          (blur)="touch.emit()"
        />
      </div>

      <div
        role="group"
        class="flex flex-wrap gap-1.5"
        [attr.aria-label]="'forms.color.swatches' | t"
      >
        @for (swatch of swatches(); track swatch) {
          <button
            type="button"
            class="size-6 rounded-md ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-ring focus-visible:ring-2 focus-visible:ring-ring outline-none"
            [class.ring-2]="value() === swatch"
            [class.ring-foreground]="value() === swatch"
            [style.background-color]="swatch"
            [attr.aria-label]="swatch"
            [attr.aria-pressed]="value() === swatch"
            [disabled]="disabled()"
            (click)="value.set(swatch); touch.emit()"
          ></button>
        }
      </div>
    </app-form-field-wrapper>
  `,
})
export class FormColorInput extends FormControlBase<string> {
  readonly value = model<string>('');

  readonly swatches = input<readonly string[]>(DEFAULT_COLOR_SWATCHES);
}
