import { booleanAttribute, Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

/**
 * Painel branco com borda e sombra: `<section appCard class="flex flex-col gap-4">`.
 * Classes extras no próprio elemento somam/sobrescrevem as padrão.
 */
@Directive({
  selector: '[appCard]',
})
export class UtilsCard {
  readonly noPadding = input(false, { transform: booleanAttribute });
  readonly noBorder = input(false, { transform: booleanAttribute });
  /** Classes de fundo — troque para cards translúcidos (ex.: telas de login). */
  readonly background = input('bg-white dark:bg-neutral-900');

  constructor() {
    classes(() => [
      'block rounded-2xl shadow-sm dark:shadow-none',
      !this.noPadding() && 'p-6',
      !this.noBorder() && 'border border-gray-200 dark:border-gray-800',
      this.background(),
    ]);
  }
}
