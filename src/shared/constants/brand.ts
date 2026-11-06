/** Nome usado quando `APP_NAME` não está no `.env`. */
export const DEFAULT_BRAND_NAME = 'StockFlow';

export const AUTHOR_NAME = 'Vinícius Nolêto de Araújo';

export const AUTHOR_LINKEDIN_URL = 'https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/';

/**
 * Configuração pública lida do `.env` pelo servidor do web, em tempo de execução
 * (trocar o nome não exige rebuild). O servidor a injeta no HTML como
 * `window.__APP_CONFIG__`; no SSR é lida direto do `process.env`.
 */
export type PublicAppConfig = {
  appName: string;
};

export const PUBLIC_APP_CONFIG_GLOBAL = '__APP_CONFIG__';

export function publicAppConfigFromEnv(env: Record<string, string | undefined>): PublicAppConfig {
  return {
    appName: env['APP_NAME']?.trim() || DEFAULT_BRAND_NAME,
  };
}
