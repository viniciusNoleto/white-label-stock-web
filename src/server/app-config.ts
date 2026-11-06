import type { RequestHandler } from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DEFAULT_BRAND_NAME,
  PUBLIC_APP_CONFIG_GLOBAL,
  type PublicAppConfig,
  publicAppConfigFromEnv,
} from '../shared/constants/brand';

export function publicAppConfig(): PublicAppConfig {
  return publicAppConfigFromEnv(process.env);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Injeta a configuração pública (`window.__APP_CONFIG__`) no `<head>` e troca o
 * `<title>` padrão do `index.html` pelo nome configurado — as páginas SSR já
 * saem com o título certo; o shell das páginas `RenderMode.Client`, não.
 */
export function injectPublicAppConfig(html: string, config: PublicAppConfig) {
  // `<` escapado: o valor nunca fecha a tag <script>.
  const json = JSON.stringify(config).replace(/</g, '\\u003c');
  const script = `<script>window.${PUBLIC_APP_CONFIG_GLOBAL} = ${json};</script>`;

  return html
    .replace(`<title>${DEFAULT_BRAND_NAME}</title>`, `<title>${escapeHtml(config.appName)}</title>`)
    .replace('</head>', `${script}</head>`);
}

/** Aplica `injectPublicAppConfig` às respostas HTML do Angular. */
export async function withPublicAppConfig(response: Response): Promise<Response> {
  if (!response.headers.get('content-type')?.includes('text/html')) return response;

  const headers = new Headers(response.headers);
  headers.delete('content-length');

  return new Response(injectPublicAppConfig(await response.text(), publicAppConfig()), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** `site.webmanifest` com `name`/`short_name` do `.env` (o arquivo em `public/` é a base). */
export function webManifest(browserDistFolder: string): RequestHandler {
  let base: Record<string, unknown> | undefined;

  return (_req, res, next) => {
    try {
      base ??= JSON.parse(readFileSync(join(browserDistFolder, 'site.webmanifest'), 'utf8')) as Record<string, unknown>;
    } catch {
      return next();
    }

    const { appName } = publicAppConfig();

    res.type('application/manifest+json').send(JSON.stringify({ ...base, name: appName, short_name: appName }));
  };
}
