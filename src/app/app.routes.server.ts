import { RenderMode, type ServerRoute } from '@angular/ssr';

/**
 * - Páginas públicas (home, login, 404): SSR a cada requisição, já no idioma
 *   do cookie `language`.
 * - Painel e inventário: renderizados no browser. Os dados dependem da sessão
 *   (tokens nos cookies, lidos só no browser) e são buscados pelo AppClient; o servidor só entrega o
 *   app depois do middleware de sessão (src/server/page-session.ts).
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'inventory',
    renderMode: RenderMode.Client,
  },
  {
    path: 'inventory/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
