// Nomes dos cookies de sessão. A API (white-label-stock-api) devolve os tokens
// no corpo do login/refresh e lê o access token do header `Authorization: Bearer`;
// o web guarda os dois em cookies comuns (não httpOnly) da própria origem:
// o browser lê para montar o header (`AuthTokens`) e o servidor lê para
// renovar a sessão antes de servir uma página (src/server/page-session.ts).
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Idioma escolhido pelo usuário. Cookie comum (não httpOnly) para que o SSR
// renderize as páginas públicas já no idioma certo.
export const LANGUAGE_COOKIE = 'language';
