import { InjectionToken, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import {
  DEFAULT_BRAND_NAME,
  PUBLIC_APP_CONFIG_GLOBAL,
  type PublicAppConfig,
  publicAppConfigFromEnv,
} from '@/shared/constants/brand';

/**
 * Nome do sistema (`APP_NAME` do `.env`). No SSR vem do `process.env`; no browser,
 * do `window.__APP_CONFIG__` que o servidor injeta no HTML.
 */
export const BRAND_NAME = new InjectionToken<string>('BRAND_NAME', {
  providedIn: 'root',
  factory: () => {
    if (isPlatformServer(inject(PLATFORM_ID))) return publicAppConfigFromEnv(process.env).appName;

    const config = (globalThis as Record<string, unknown>)[PUBLIC_APP_CONFIG_GLOBAL] as PublicAppConfig | undefined;

    return config?.appName || DEFAULT_BRAND_NAME;
  },
});
