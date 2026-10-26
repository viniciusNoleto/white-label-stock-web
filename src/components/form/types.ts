import { booleanAttribute, computed, Directive, input, type ModelSignal, output } from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';

let nextId = 0;

/**
 * Base de todos os inputs de formulário (`FormTextInput`, `FormSelect`, …).
 *
 * Implementa o contrato `FormValueControl` do Signal Forms: ligado com
 * `[formField]="…field.name"`, o Angular sincroniza sozinho `value`, `errors`,
 * `touched` e `disabled`, e escuta `touch` (blur) para marcar o campo como
 * tocado. Fora de formulário funciona com `[(value)]`.
 *
 * O erro só aparece depois que o campo foi tocado (blur ou `validate()`).
 */
@Directive()
export abstract class FormControlBase<T> implements FormValueControl<T> {
  abstract readonly value: ModelSignal<T>;

  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly touched = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly label = input<string>();
  readonly description = input<string>();
  readonly placeholder = input<string>('');
  /** Asterisco visual de obrigatório — a regra de obrigatoriedade vem do schema Yup. */
  readonly withAsterisk = input(false, { transform: booleanAttribute });
  readonly inputId = input(`app-form-control-${nextId++}`);

  protected readonly showError = computed(() => this.touched() && this.errors().length > 0);
  protected readonly errorMessage = computed(() => (this.showError() ? this.errors()[0]?.message : undefined));
}
