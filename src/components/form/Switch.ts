import { Component, model } from '@angular/core';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { FormControlBase } from './types';

/**
 * Liga/desliga com o rótulo ao lado (e a descrição embaixo). `value` é sempre `boolean`.
 */
@Component({
  selector: 'app-form-switch',
  imports: [HlmSwitchImports],
  host: { class: 'block' },
  template: `
    <div class="flex items-start gap-3">
      <hlm-switch
        class="mt-0.5"
        [inputId]="inputId()"
        [checked]="value()"
        [disabled]="disabled()"
        [aria-labelledby]="inputId() + '-label'"
        [aria-describedby]="description() ? inputId() + '-description' : null"
        (checkedChange)="change($event)"
      />

      <div class="flex flex-col gap-1">
        <label
          class="text-sm font-medium leading-none"
          [id]="inputId() + '-label'"
          [for]="inputId()"
        >
          {{ label() }}
        </label>

        @if (description()) {
          <p
            class="text-sm text-muted-foreground"
            [id]="inputId() + '-description'"
          >
            {{ description() }}
          </p>
        }
      </div>
    </div>
  `,
})
export class FormSwitch extends FormControlBase<boolean> {
  readonly value = model(false);

  protected change(checked: boolean) {
    this.value.set(checked);
    this.touch.emit();
  }
}
