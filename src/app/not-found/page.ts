import { Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormButton } from '@/components/form/Button';
import { AttributionFooter } from '@/components/layout/AttributionFooter';
import { WarehouseBackground } from '@/components/layout/WarehouseBackground';
import { UtilsCard } from '@/components/utils/Card';
import { TranslatePipe } from '@/utils/translate.pipe';

/** Larguras das barras do código de barras decorativo (o mesmo da etiqueta do login). */
const BARCODE_BARS = [2, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2];

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, FormButton, AttributionFooter, WarehouseBackground, UtilsCard, TranslatePipe],
  host: { class: 'flex flex-col flex-1 min-h-dvh' },
  template: `
    <div class="relative flex flex-1 flex-col">
      <app-warehouse-background />

      <main class="relative flex flex-1 items-center justify-center px-6 pt-10 pb-40">
        <section
          appCard
          noPadding
          background="bg-white/85 dark:bg-neutral-900/85"
          class="relative flex w-full max-w-md flex-col overflow-hidden pt-1.5"
        >
          <span
            aria-hidden="true"
            class="absolute inset-x-0 top-0 h-1.5 bg-hazard-stripes"
          ></span>

          <div class="flex items-end justify-between gap-4 border-b border-dashed border-gray-300 px-8 pt-8 pb-6 dark:border-neutral-700">
            <p class="font-mono text-7xl font-medium leading-none tracking-tight text-primary-500">
              404
            </p>

            <span
              aria-hidden="true"
              class="flex h-10 items-stretch gap-0.5 opacity-50"
            >
              @for (bar of barcodeBars; track $index) {
                <span
                  class="bg-gray-800 dark:bg-gray-300"
                  [style.width.px]="bar"
                ></span>
              }
            </span>
          </div>

          <div class="flex flex-col items-start gap-6 px-8 py-8">
            <div class="flex flex-col gap-2">
              <h1 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                {{ 'notFound.title' | t }}
              </h1>

              <p class="text-gray-600 dark:text-gray-400">
                {{ 'notFound.description' | t }}
              </p>
            </div>

            <a
              appButton
              routerLink="/"
              leftIcon="lucideChevronLeft"
            >
              {{ 'notFound.back' | t }}
            </a>
          </div>
        </section>
      </main>
    </div>

    <app-attribution-footer />
  `,
})
export class NotFoundPage {
  protected readonly barcodeBars = BARCODE_BARS;

  constructor() {
    // No SSR, responde 404 de verdade (não 200 com a página de erro).
    const responseInit = inject(RESPONSE_INIT, { optional: true });
    if (responseInit) responseInit.status = 404;
  }
}
