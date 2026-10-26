import { Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormButton } from '@/components/form/Button';
import { AttributionFooter } from '@/components/layout/AttributionFooter';
import { WarehouseBackground } from '@/components/layout/WarehouseBackground';
import { TranslatePipe } from '@/utils/translate.pipe';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, FormButton, AttributionFooter, WarehouseBackground, TranslatePipe],
  host: { class: 'flex flex-col flex-1 min-h-dvh' },
  template: `
    <div class="relative flex flex-1 flex-col">
      <app-warehouse-background />

      <main class="relative flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-40 text-center">
        <p class="text-6xl font-bold text-primary-500">
          404
        </p>

        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ 'notFound.title' | t }}
        </h1>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ 'notFound.description' | t }}
        </p>

        <a
          appButton
          routerLink="/"
        >
          {{ 'notFound.back' | t }}
        </a>
      </main>
    </div>

    <app-attribution-footer />
  `,
})
export class NotFoundPage {
  constructor() {
    // No SSR, responde 404 de verdade (não 200 com a página de erro).
    const responseInit = inject(RESPONSE_INIT, { optional: true });
    if (responseInit) responseInit.status = 404;
  }
}
