import { booleanAttribute, Component, input } from '@angular/core';
import { HlmFieldImports } from '@spartan-ng/helm/field';

/**
 * Moldura comum dos inputs: label (com asterisco opcional), controle
 * projetado, descrição e mensagem de erro.
 */
@Component({
  selector: 'app-form-field-wrapper',
  imports: [HlmFieldImports],
  host: { class: 'block' },
  template: `
    <div
      hlmField
      [forceInvalid]="invalid()"
    >
      @if (label()) {
        <label
          hlmFieldLabel
          [for]="controlId()"
        >
          {{ label() }}

          @if (withAsterisk()) {
            <span
              class="text-destructive"
              aria-hidden="true"
            >
              *
            </span>
          }
        </label>
      }

      <ng-content />

      @if (description()) {
        <p hlmFieldDescription>
          {{ description() }}
        </p>
      }

      @if (error()) {
        <hlm-field-error forceShow>
          {{ error() }}
        </hlm-field-error>
      }
    </div>
  `,
})
export class FormFieldWrapper {
  readonly label = input<string>();
  readonly description = input<string>();
  readonly error = input<string>();
  readonly controlId = input<string>();
  readonly invalid = input(false);
  readonly withAsterisk = input(false, { transform: booleanAttribute });
}
