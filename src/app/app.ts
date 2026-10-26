import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { ColorSchemeService } from '@/utils/color-scheme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HlmToasterImports],
  host: { class: 'flex flex-col min-h-dvh' },
  template: `
    <router-outlet />

    <hlm-toaster
      position="top-right"
      richColors
      [theme]="colorScheme.resolvedColorScheme()"
    />
  `,
})
export class App {
  protected readonly colorScheme = inject(ColorSchemeService);
}
