import { Component, computed, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { FormButton } from '@/components/form/Button';
import { type ColorScheme, ColorSchemeService } from '@/utils/color-scheme';
import { TranslatePipe } from '@/utils/translate.pipe';

const COLOR_SCHEME_OPTIONS: { value: ColorScheme; icon: string; labelKey: string }[] = [
  { value: 'light', icon: 'lucideSun', labelKey: 'header.colorScheme.light' },
  { value: 'dark', icon: 'lucideMoon', labelKey: 'header.colorScheme.dark' },
  { value: 'auto', icon: 'lucideMonitor', labelKey: 'header.colorScheme.auto' },
];

@Component({
  selector: 'app-color-scheme-switcher',
  imports: [HlmDropdownMenuImports, FormButton, NgIcon, TranslatePipe],
  template: `
    <button
      appButton
      variant="outline"
      size="icon"
      class="rounded-lg"
      align="end"
      [icon]="currentIcon()"
      [attr.aria-label]="'header.colorScheme.label' | t"
      [hlmDropdownMenuTrigger]="menu"
    ></button>

    <ng-template #menu>
      <hlm-dropdown-menu class="w-44">
        <hlm-dropdown-menu-label>
          {{ 'header.colorScheme.label' | t }}
        </hlm-dropdown-menu-label>

        <hlm-dropdown-menu-group>
          @for (option of options; track option.value) {
            <button
              hlmDropdownMenuRadio
              [checked]="option.value === colorScheme.colorScheme()"
              (triggered)="colorScheme.setColorScheme(option.value)"
            >
              <ng-icon [name]="option.icon" />

              {{ option.labelKey | t }}

              <hlm-dropdown-menu-radio-indicator />
            </button>
          }
        </hlm-dropdown-menu-group>
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class ColorSchemeSwitcher {
  protected readonly colorScheme = inject(ColorSchemeService);

  protected readonly options = COLOR_SCHEME_OPTIONS;

  protected readonly currentIcon = computed(
    () => COLOR_SCHEME_OPTIONS.find((option) => option.value === this.colorScheme.colorScheme())?.icon ?? 'lucideMonitor',
  );
}
