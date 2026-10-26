import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, REQUEST, Service, signal } from '@angular/core';
import i18next, { type TOptions } from 'i18next';
import enUS from '@/locales/en-us';
import esMX from '@/locales/es-mx';
import ptBR from '@/locales/pt-br';
import { setYupLocale } from '@/libs/yup/yup-locale';
import { LANGUAGE_COOKIE } from '@/shared/constants/auth';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/shared/constants/locale';

export const DEFAULT_LOCALE: SupportedLocale = 'pt-br';

const HTML_LANG: Record<SupportedLocale, string> = {
  'pt-br': 'pt-BR',
  'es-mx': 'es-MX',
  'en-us': 'en-US',
};

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly unknown[]).includes(value);
}

function readCookie(cookieHeader: string | null | undefined, name: string): string | null {
  const match = cookieHeader?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Fonte única do idioma. Cada app (no browser, ou cada requisição no SSR) tem
 * a sua instância do i18next — nada de singleton de módulo compartilhado entre
 * requisições concorrentes no servidor.
 *
 * O idioma vive num cookie (não em localStorage) para que o SSR já renderize
 * as páginas públicas no idioma escolhido, sem piscar na hidratação.
 */
@Service()
export class I18n {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly request = inject(REQUEST, { optional: true });

  private readonly instance = i18next.createInstance();

  private readonly _language = signal<SupportedLocale>(this.detectLanguage());

  /** Idioma atual. Ler este signal num template/computed re-renderiza ao trocar o idioma. */
  readonly language = this._language.asReadonly();

  constructor() {
    this.instance.init({
      lng: this._language(),
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: [...SUPPORTED_LOCALES],
      lowerCaseLng: true,
      initAsync: false,
      resources: {
        'pt-br': { translation: ptBR },
        'es-mx': { translation: esMX },
        'en-us': { translation: enUS },
      },
      interpolation: { escapeValue: false },
    });

    this.applyLanguage(this._language());
  }

  /** Traduz uma chave. Reativo: chamado num template/computed, acompanha a troca de idioma. */
  t(key: string, options?: TOptions): string {
    this._language();

    return this.instance.t(key, options) as string;
  }

  changeLanguage(locale: SupportedLocale) {
    this.instance.changeLanguage(locale);
    this._language.set(locale);
    this.applyLanguage(locale);

    if (this.isBrowser) {
      this.document.cookie = `${LANGUAGE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }

  private applyLanguage(locale: SupportedLocale) {
    setYupLocale(locale);
    this.document.documentElement.lang = HTML_LANG[locale];
  }

  private detectLanguage(): SupportedLocale {
    const cookieHeader = this.isBrowser ? this.document.cookie : this.request?.headers.get('cookie');
    const fromCookie = readCookie(cookieHeader, LANGUAGE_COOKIE);

    return isSupportedLocale(fromCookie) ? fromCookie : DEFAULT_LOCALE;
  }
}
