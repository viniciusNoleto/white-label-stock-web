// Nomes dos cookies de sessão. Ambos são httpOnly, gravados e apagados só pelas
// rotas de /api/auth/** (via src/server/auth/session.ts) — nenhum código do
// browser lê ou escreve esses cookies. Ficam fora de src/server/ porque o
// middleware de páginas (src/server/auth/page-session.ts) e os testes também
// precisam deles.
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Idioma escolhido pelo usuário. Cookie comum (não httpOnly) para que o SSR
// renderize as páginas públicas já no idioma certo.
export const LANGUAGE_COOKIE = 'language';
