import { Component, input, model } from '@angular/core';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { FormFieldWrapper } from './FieldWrapper';
import { type SelectOption, type SelectValue } from './Select';
import { FormControlBase } from './types';

/**
 * Escolha única entre poucas opções, sempre visíveis (substitui o
 * `SegmentedControl` do Mantine). Nunca fica sem valor.
 */
@Component({
  selector: 'app-form-segmented-control',
  imports: [FormFieldWrapper, HlmToggleGroupImports],
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
      <hlm-toggle-group
        type="single"
        variant="outline"
        class="w-full"
        [id]="inputId()"
        [nullable]="false"
        [disabled]="disabled()"
        [value]="value()"
        (valueChange)="onChange($event)"
      >
        @for (option of data(); track option.value) {
          <button
            hlmToggleGroupItem
            class="flex-1"
            [value]="option.value"
          >
            {{ option.label }}
          </button>
        }
      </hlm-toggle-group>
    </app-form-field-wrapper>
  `,
})
export class FormSegmentedControl extends FormControlBase<SelectValue | null> {
  readonly value = model<SelectValue | null>(null);

  readonly data = input<readonly SelectOption[]>([]);

  protected onChange(next: unknown) {
    if (next === null || next === undefined) return;

    this.value.set(next as SelectValue);
    this.touch.emit();
  }
}
