import { Component } from '@angular/core';
import { TranslatePipe } from '@/utils/translate.pipe';

/**
 * Indicador de carregamento: uma caixa cujas abas abrem e fecham em loop.
 * Não controla quando aparece — combine com `delayedFlag` para não piscar.
 */
@Component({
  selector: 'app-utils-loader',
  imports: [TranslatePipe],
  host: {
    role: 'status',
    class: 'flex flex-col items-center gap-3',
  },
  template: `
    <span
      aria-hidden="true"
      class="loader-box"
    >
      <span class="loader-box-item"></span>

      <span class="loader-box-flap loader-box-flap-left"></span>

      <span class="loader-box-flap loader-box-flap-right"></span>

      <span class="loader-box-body"></span>
    </span>

    <span class="text-sm text-gray-600 dark:text-gray-400">
      {{ 'common.loading' | t }}
    </span>
  `,
})
export class UtilsLoader {}
