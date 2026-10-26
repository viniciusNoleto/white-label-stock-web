// Nomes dos cookies de sessão. Ambos são httpOnly, gravados e apagados só pela
// API (white-label-stock-api, rotas /api/auth/**) — nenhum código do browser lê
// ou escreve esses cookies. O middleware de páginas (src/server/page-session.ts)
// e os testes precisam dos nomes.
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Idioma escolhido pelo usuário. Cookie comum (não httpOnly) para que o SSR
// renderize as páginas públicas já no idioma certo.
export const LANGUAGE_COOKIE = 'language';
