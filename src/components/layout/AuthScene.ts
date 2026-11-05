import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '@/utils/translate.pipe';
import { UtilsCard } from '../utils/Card';
import { AttributionFooter } from './AttributionFooter';
import { BrandMark } from './BrandMark';
import { ColorSchemeSwitcher } from './ColorSchemeSwitcher';
import { FlowDiagram } from './FlowDiagram';
import { LanguageSwitcher } from './LanguageSwitcher';
import { WarehouseBackground } from './WarehouseBackground';

/** Larguras das barras do código de barras decorativo do card (etiqueta de envio). */
const BARCODE_BARS = [2, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2];

/**
 * Cena das telas públicas de conta (login e cadastro): galpão ao fundo, vitrine do sistema à esquerda e o
 * card-etiqueta à direita, com o conteúdo projetado (`<ng-content />`) abaixo da marca.
 */
@Component({
  selector: 'app-auth-scene',
  imports: [NgIcon, AttributionFooter, BrandMark, ColorSchemeSwitcher, FlowDiagram, LanguageSwitcher, WarehouseBackground, UtilsCard, TranslatePipe],
  host: { class: 'flex flex-col flex-1 min-h-dvh' },
  template: `
    <div class="relative flex flex-1 flex-col">
      <app-warehouse-background />

      <div class="relative flex justify-end gap-2.5 p-4">
        <app-language-switcher />

        <app-color-scheme-switcher />
      </div>

      <main class="relative flex flex-1 items-center justify-center px-6 pt-4 pb-40">
        <div class="grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1fr_28rem]">
          <section class="hidden flex-col gap-8 lg:flex">
            <span class="inline-flex w-fit items-center gap-2 border border-primary-200 bg-white/70 px-3 py-1 text-xs font-medium text-primary-600 backdrop-blur-sm dark:border-primary-900 dark:bg-neutral-900/70 dark:text-primary-300">
              <ng-icon
                name="lucideBoxes"
                size="14"
              />

              {{ 'auth.login.showcase.eyebrow' | t }}
            </span>

            <div class="flex flex-col gap-4">
              <h2 class="max-w-xl text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-100">
                {{ 'auth.login.showcase.title' | t }}
              </h2>

              <p class="max-w-lg text-base leading-relaxed text-gray-600 dark:text-gray-400">
                {{ 'auth.login.showcase.description' | t }}
              </p>
            </div>

            <app-flow-diagram
              appCard
              background="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm"
              class="max-w-xl"
            />
          </section>

          <section
            appCard
            background="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md"
            class="relative mx-auto flex w-full max-w-md flex-col gap-6 overflow-hidden p-8 pt-10 sm:p-10 sm:pt-12"
          >
            <span
              aria-hidden="true"
              class="absolute inset-x-0 top-0 h-1.5 bg-hazard-stripes"
            ></span>

            <div class="flex items-center justify-between gap-4">
              <app-brand-mark />

              <span
                aria-hidden="true"
                class="flex h-7 items-stretch gap-0.5 opacity-50"
              >
                @for (bar of barcodeBars; track $index) {
                  <span
                    class="bg-gray-800 dark:bg-gray-300"
                    [style.width.px]="bar"
                  ></span>
                }
              </span>
            </div>

            <ng-content />
          </section>
        </div>
      </main>
    </div>

    <app-attribution-footer />
  `,
})
export class AuthScene {
  protected readonly barcodeBars = BARCODE_BARS;
}
