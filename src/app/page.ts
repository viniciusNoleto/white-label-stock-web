import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FormButton } from '@/components/form/Button';
import { AttributionFooter } from '@/components/layout/AttributionFooter';
import { BrandMark } from '@/components/layout/BrandMark';
import { ColorSchemeSwitcher } from '@/components/layout/ColorSchemeSwitcher';
import { FlowDiagram } from '@/components/layout/FlowDiagram';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { WarehouseBackground } from '@/components/layout/WarehouseBackground';
import { UtilsCard } from '@/components/utils/Card';
import { BRAND_NAME } from '@/shared/constants/brand';
import { TranslatePipe } from '@/utils/translate.pipe';

/** Larguras das barras do código de barras decorativo (o mesmo da etiqueta do login). */
const BARCODE_BARS = [2, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2];

const FEATURES = [
  { icon: 'lucideFolder', titleKey: 'home.features.categories.title', descriptionKey: 'home.features.categories.description' },
  { icon: 'lucideChartLine', titleKey: 'home.features.stock.title', descriptionKey: 'home.features.stock.description' },
  { icon: 'lucideBoxes', titleKey: 'home.features.build.title', descriptionKey: 'home.features.build.description' },
] as const;

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, NgIcon, FormButton, AttributionFooter, BrandMark, ColorSchemeSwitcher, FlowDiagram, LanguageSwitcher, WarehouseBackground, UtilsCard, TranslatePipe],
  host: { class: 'flex flex-col flex-1 min-h-dvh' },
  template: `
    <div class="relative flex flex-1 flex-col">
      <app-warehouse-background />

      <div class="relative z-10 flex justify-end gap-2.5 p-4">
        <app-language-switcher />

        <app-color-scheme-switcher />
      </div>

      <main class="relative z-10 flex flex-1 items-center justify-center px-6 pt-4 pb-40">
        <div class="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_28rem] lg:gap-16">
          <section class="flex flex-col gap-8">
            <div class="flex flex-col gap-4">
              <h1 class="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
                {{ brandName }}
              </h1>

              <p class="max-w-xl text-xl text-gray-700 dark:text-gray-300">
                {{ 'home.subtitle' | t }}
              </p>

              <p class="max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
                {{ 'home.description' | t }}
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <a
                appButton
                size="lg"
                class="px-8 has-data-[icon=inline-end]:pr-8"
                routerLink="/inventory"
                rightIcon="lucideChevronRight"
              >
                {{ 'home.ctaPrimary' | t }}
              </a>

              <a
                appButton
                size="lg"
                variant="outline"
                class="bg-white/70 px-8 dark:bg-neutral-900/70"
                href="#features"
              >
                {{ 'home.ctaSecondary' | t }}
              </a>
            </div>

            <app-flow-diagram
              appCard
              background="bg-white/60 dark:bg-neutral-900/60"
              class="max-w-xl px-4! sm:px-6!"
            />
          </section>

          <!-- Etiqueta de expedição com o que o sistema faz — mesma linguagem do card de login. -->
          <section
            id="features"
            appCard
            noPadding
            background="bg-white/85 dark:bg-neutral-900/85"
            class="relative mx-auto flex w-full max-w-md scroll-mt-8 flex-col overflow-hidden pt-1.5"
            [attr.aria-label]="'home.ctaSecondary' | t"
          >
            <span
              aria-hidden="true"
              class="absolute inset-x-0 top-0 h-1.5 bg-hazard-stripes"
            ></span>

            <div class="flex items-center justify-between gap-4 border-b border-gray-200 px-8 py-6 dark:border-neutral-800">
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

            <ul class="flex flex-col">
              @for (feature of features; track feature.titleKey) {
                <li class="flex gap-4 border-b border-gray-200 px-8 py-6 last:border-b-0 dark:border-neutral-800">
                  <span
                    aria-hidden="true"
                    class="center-flex size-10 shrink-0 border border-primary-200 text-primary-500 dark:border-primary-900 dark:text-primary-300"
                  >
                    <ng-icon
                      size="20"
                      [name]="feature.icon"
                    />
                  </span>

                  <div class="flex flex-col gap-1">
                    <h2 class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ feature.titleKey | t }}
                    </h2>

                    <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {{ feature.descriptionKey | t }}
                    </p>
                  </div>
                </li>
              }
            </ul>
          </section>
        </div>
      </main>
    </div>

    <app-attribution-footer />
  `,
})
export class HomePage {
  protected readonly brandName = BRAND_NAME;
  protected readonly features = FEATURES;
  protected readonly barcodeBars = BARCODE_BARS;
}
