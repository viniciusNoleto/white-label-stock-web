import { Component, computed, input, model } from '@angular/core';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import { TranslatePipe } from '@/utils/translate.pipe';
import { FormFieldWrapper } from './FieldWrapper';
import { type SelectValue, toSelectOptions } from './Select';
import { FormControlBase } from './types';

/**
 * Seleção múltipla com busca (chips). Mesmos modos de `data` do `FormSelect`.
 * `value` é sempre um array — nunca `null`.
 */
@Component({
  selector: 'app-form-multi-select',
  imports: [FormFieldWrapper, HlmComboboxImports, TranslatePipe],
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
      <hlm-combobox-multiple
        [value]="value()"
        [itemToString]="itemToString"
        [disabled]="disabled()"
        (valueChange)="value.set($event ?? [])"
        (closed)="touch.emit()"
      >
        <hlm-combobox-chips class="w-full">
          <ng-template
            hlmComboboxValues
            let-values
          >
            @for (selected of values; track selected) {
              <hlm-combobox-chip [value]="selected">
                {{ itemToString(selected) }}
              </hlm-combobox-chip>
            }
          </ng-template>

          <input
            hlmComboboxChipInput
            [id]="inputId()"
            [placeholder]="value().length ? '' : placeholder()"
            [aria-invalid]="showError()"
          />
        </hlm-combobox-chips>

        <hlm-combobox-content *hlmComboboxPortal>
          <hlm-combobox-empty>
            {{ 'forms.select.empty' | t }}
          </hlm-combobox-empty>

          <div hlmComboboxList>
            @for (option of options(); track option.value) {
              <hlm-combobox-item [value]="option.value">
                {{ option.label }}
              </hlm-combobox-item>
            }
          </div>
        </hlm-combobox-content>
      </hlm-combobox-multiple>
    </app-form-field-wrapper>
  `,
})
export class FormMultiSelect extends FormControlBase<SelectValue[]> {
  readonly value = model<SelectValue[]>([]);

  readonly data = input<readonly unknown[]>([]);
  readonly valueField = input<string>();
  readonly labelField = input<string>();

  protected readonly options = computed(() => toSelectOptions(this.data(), this.valueField(), this.labelField()));

  protected readonly itemToString = (value: SelectValue) =>
    this.options().find((option) => option.value === value)?.label ?? '';
}
