import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, effect, inject, PLATFORM_ID, Service, signal } from '@angular/core';

export type ColorScheme = 'light' | 'dark' | 'auto';

export const COLOR_SCHEME_STORAGE_KEY = 'white-label-inventory-system:color-scheme';

/**
 * Aparência claro/escuro/sistema (o `useMantineColorScheme` do React). A
 * classe `dark` no `<html>` é aplicada antes da pintura por um script inline
 * em `src/index.html`; este serviço mantém tudo sincronizado depois disso.
 */
@Service()
export class ColorSchemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly systemPrefersDark = signal(false);

  readonly colorScheme = signal<ColorScheme>(this.readStored());

  readonly resolvedColorScheme = computed<'light' | 'dark'>(() => {
    const scheme = this.colorScheme();
    if (scheme !== 'auto') return scheme;

    return this.systemPrefersDark() ? 'dark' : 'light';
  });

  constructor() {
    if (!this.isBrowser) return;

    const media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');

    if (media) {
      this.systemPrefersDark.set(media.matches);

      const listener = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
      media.addEventListener('change', listener);
      inject(DestroyRef).onDestroy(() => media.removeEventListener('change', listener));
    }

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.resolvedColorScheme() === 'dark');
    });
  }

  setColorScheme(scheme: ColorScheme) {
    this.colorScheme.set(scheme);

    try {
      this.document.defaultView?.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
    } catch {
      // armazenamento indisponível (aba privada, bloqueio) — só não persiste
    }
  }

  private readStored(): ColorScheme {
    if (!this.isBrowser) return 'auto';

    try {
      const stored = this.document.defaultView?.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : 'auto';
    } catch {
      return 'auto';
    }
  }
}
