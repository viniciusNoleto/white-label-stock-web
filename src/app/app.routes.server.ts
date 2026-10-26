import { RenderMode, type ServerRoute } from '@angular/ssr';

/**
 * - Páginas públicas (home, login, 404): SSR a cada requisição, já no idioma
 *   do cookie `language`.
 * - Inventário: renderizado no browser. Os dados dependem da sessão
 *   (cookies httpOnly) e são buscados pelo AppClient; o servidor só entrega o
 *   app depois do middleware de sessão (src/server/auth/middleware.ts).
 */
export const serverRoutes: ServerRoute[] = [
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
