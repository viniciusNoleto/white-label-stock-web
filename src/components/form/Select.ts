import { Component, computed, input, model } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { TranslatePipe } from '@/utils/translate.pipe';
import { FormFieldWrapper } from './FieldWrapper';
import { FormControlBase } from './types';

export type SelectValue = string | number;

export type SelectOption = { value: SelectValue; label: string };

/**
 * Converte `data` em opções. Dois modos:
 * - objeto: `data` = entidades + `valueField`/`labelField`;
 * - direto: `data` = `string[]` ou `{ value, label }[]`.
 */
export function toSelectOptions(data: readonly unknown[], valueField?: string, labelField?: string): SelectOption[] {
  return data.map((item) => {
    if (valueField && labelField && typeof item === 'object' && item !== null) {
      const record = item as Record<string, unknown>;
      return { value: record[valueField] as SelectValue, label: String(record[labelField] ?? '') };
    }

    if (typeof item === 'object' && item !== null) return item as SelectOption;

    return { value: item as SelectValue, label: String(item) };
  });
}

@Component({
  selector: 'app-form-select',
  imports: [FormFieldWrapper, HlmSelectImports, NgIcon, TranslatePipe],
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
        <hlm-select
          [value]="value()"
          [itemToString]="itemToString"
          [disabled]="disabled()"
          (valueChange)="value.set($event ?? null)"
          (closed)="touch.emit()"
        >
          <hlm-select-trigger
            class="w-full"
            [class.pe-14]="showClear()"
            [buttonId]="inputId()"
            [forceInvalid]="showError()"
            [aria-invalid]="showError()"
          >
            <hlm-select-value [placeholder]="placeholder()" />
          </hlm-select-trigger>

          <hlm-select-content
            *hlmSelectPortal
            showScroll
          >
            <hlm-select-group>
              @for (option of options(); track option.value) {
                <hlm-select-item [value]="option.value">
                  {{ option.label }}
                </hlm-select-item>
              } @empty {
                <p class="px-2 py-4 text-center text-sm text-muted-foreground">
                  {{ 'forms.select.empty' | t }}
                </p>
              }
            </hlm-select-group>
          </hlm-select-content>
        </hlm-select>

        @if (showClear()) {
          <button
            type="button"
            class="absolute right-8 top-1/2 -translate-y-1/2 center-flex size-5 rounded-sm text-muted-foreground hover:bg-muted"
            [attr.aria-label]="'forms.select.clear' | t"
            (click)="clear()"
          >
            <ng-icon
              name="lucideX"
              size="14"
            />
          </button>
        }
      </div>
    </app-form-field-wrapper>
  `,
})
export class FormSelect extends FormControlBase<SelectValue | null> {
  readonly value = model<SelectValue | null>(null);

  readonly data = input<readonly unknown[]>([]);
  readonly valueField = input<string>();
  readonly labelField = input<string>();
  readonly clearable = input(false);

  protected readonly options = computed(() => toSelectOptions(this.data(), this.valueField(), this.labelField()));

  protected readonly showClear = computed(() => this.clearable() && this.value() !== null && !this.disabled());

  protected readonly itemToString = (value: SelectValue) =>
    this.options().find((option) => option.value === value)?.label ?? '';

  protected clear() {
    this.value.set(null);
    this.touch.emit();
  }
}
