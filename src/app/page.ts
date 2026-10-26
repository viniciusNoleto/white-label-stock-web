import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FormButton } from '@/components/form/Button';
import { AttributionFooter } from '@/components/layout/AttributionFooter';
import { ColorSchemeSwitcher } from '@/components/layout/ColorSchemeSwitcher';
import { FlowDiagram } from '@/components/layout/FlowDiagram';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { WarehouseBackground } from '@/components/layout/WarehouseBackground';
import { UtilsCard } from '@/components/utils/Card';
import { BRAND_NAME } from '@/shared/constants/brand';
import { TranslatePipe } from '@/utils/translate.pipe';

const FEATURES = [
  { icon: 'lucideFolder', titleKey: 'home.features.categories.title', descriptionKey: 'home.features.categories.description' },
  { icon: 'lucideChartLine', titleKey: 'home.features.stock.title', descriptionKey: 'home.features.stock.description' },
  { icon: 'lucideBoxes', titleKey: 'home.features.build.title', descriptionKey: 'home.features.build.description' },
] as const;

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, NgIcon, FormButton, AttributionFooter, ColorSchemeSwitcher, FlowDiagram, LanguageSwitcher, WarehouseBackground, UtilsCard, TranslatePipe],
  host: { class: 'flex flex-col flex-1 min-h-dvh' },
  template: `
    <div class="relative flex flex-1 flex-col">
      <app-warehouse-background />

      <div class="relative z-10 flex justify-end gap-2.5 p-4">
        <app-language-switcher />

        <app-color-scheme-switcher />
      </div>

      <main class="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-40">
        <div class="flex flex-col items-center gap-8 max-w-2xl text-center">
          <div class="flex flex-col items-center gap-3">
            <span class="center-flex size-16 rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-200 dark:shadow-none">
              <ng-icon
                name="lucidePackage"
                size="32"
              />
            </span>

            <h1 class="text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {{ brandName }}
            </h1>

            <p class="text-lg text-gray-500 dark:text-gray-400">
              {{ 'home.subtitle' | t }}
            </p>
          </div>

          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ 'home.description' | t }}
          </p>

          <app-flow-diagram
            appCard
            background="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm"
            class="w-full max-w-xl px-4! sm:px-6!"
          />

          <div class="flex flex-col sm:flex-row items-center gap-4">
            <a
              appButton
              size="lg"
              class="px-8"
              routerLink="/inventory"
            >
              {{ 'home.ctaPrimary' | t }}
            </a>

            <a
              appButton
              size="lg"
              variant="outline"
              class="px-8"
              href="#features"
            >
              {{ 'home.ctaSecondary' | t }}
            </a>
          </div>

          <div
            id="features"
            class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4 scroll-mt-8"
          >
            @for (feature of features; track feature.titleKey) {
              <article
                appCard
                class="flex flex-col gap-2 p-5! text-left"
              >
                <span class="center-flex size-9 rounded-lg bg-primary-500/10 text-primary-500">
                  <ng-icon [name]="feature.icon" />
                </span>

                <h2 class="font-semibold text-gray-800 dark:text-gray-100">
                  {{ feature.titleKey | t }}
                </h2>

                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ feature.descriptionKey | t }}
                </p>
              </article>
            }
          </div>
        </div>
      </main>
    </div>

    <app-attribution-footer />
  `,
})
export class HomePage {
  protected readonly brandName = BRAND_NAME;
  protected readonly features = FEATURES;
}
