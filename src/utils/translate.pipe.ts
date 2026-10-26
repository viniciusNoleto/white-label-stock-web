import { inject, Pipe, type PipeTransform } from '@angular/core';
import type { TOptions } from 'i18next';
import { I18n } from '@/libs/i18n';

/**
 * `{{ 'units.page.title' | t }}` / `{{ 'forms.build.requiredLabel' | t: { count } }}`
 *
 * Impuro de propósito: o idioma é um signal lido dentro do `transform`, então
 * a view é marcada para checagem ao trocar o idioma e o pipe precisa rodar de
 * novo mesmo com a mesma chave.
 */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(key: string, options?: TOptions): string {
    return this.i18n.t(key, options);
  }
}
