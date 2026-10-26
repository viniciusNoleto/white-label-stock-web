import { Component, computed, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { FormButton } from '@/components/form/Button';
import { I18n } from '@/libs/i18n';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/shared/constants/locale';
import { TranslatePipe } from '@/utils/translate.pipe';

const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  'pt-br': 'flagBr',
  'es-mx': 'flagMx',
  'en-us': 'flagUs',
};

@Component({
  selector: 'app-language-switcher',
  imports: [HlmDropdownMenuImports, FormButton, NgIcon, TranslatePipe],
  template: `
    <button
      appButton
      variant="outline"
      size="icon"
      class="rounded-lg"
      [attr.aria-label]="'language.label' | t"
      [hlmDropdownMenuTrigger]="menu"
      align="end"
    >
      <ng-icon
        size="20"
        class="rounded-sm overflow-hidden"
        [name]="currentFlag()"
      />
    </button>

    <ng-template #menu>
      <hlm-dropdown-menu class="w-52">
        <hlm-dropdown-menu-label>
          {{ 'language.label' | t }}
        </hlm-dropdown-menu-label>

        <hlm-dropdown-menu-group>
          @for (locale of locales; track locale) {
            <button
              hlmDropdownMenuRadio
              [checked]="locale === i18n.language()"
              (triggered)="i18n.changeLanguage(locale)"
            >
              <ng-icon
                size="16"
                [name]="flags[locale]"
              />

              {{ 'language.' + locale | t }}

              <hlm-dropdown-menu-radio-indicator />
            </button>
          }
        </hlm-dropdown-menu-group>
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class LanguageSwitcher {
  protected readonly i18n = inject(I18n);

  protected readonly locales = SUPPORTED_LOCALES;
  protected readonly flags = LOCALE_FLAGS;

  protected readonly currentFlag = computed(() => LOCALE_FLAGS[this.i18n.language()]);
}
