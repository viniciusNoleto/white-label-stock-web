import type { NextFunction, Request, Response } from 'express';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../shared/constants/auth';
import { apiUrl } from './utils/api';
import { parseCookieHeader, parseSetCookies, serializeCookieHeader } from './utils/cookies';

const PROTECTED_PAGE_PREFIXES = ['/inventory'];

const GUEST_ONLY_PAGES = ['/auth/login'];

const STATIC_FILE = /\.[a-z0-9]+$/i;

const API_TIMEOUT_MS = 10_000;

function isProtectedPage(path: string) {
  return PROTECTED_PAGE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function callApi(path: string, init: { method: string; cookie: string }) {
  return fetch(`${apiUrl()}${path}`, {
    method: init.method,
    headers: { accept: 'application/json', cookie: init.cookie },
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
}

async function hasLoggedUser(cookie: string) {
  const response = await callApi('/api/auth/me', { method: 'GET', cookie });
  if (!response.ok) return false;

  const body = await response.json();
  return !!body?.data?.user;
}

/**
 * Equivalente ao proxy.ts do rentable para as navegações de página.
 *
 * Quando o cookie de access já expirou (o browser o descarta junto com o
 * token) mas ainda há refresh_token, renova a sessão na API ANTES de entregar
 * a página — assim o primeiro request da página no browser já sai com um
 * access token válido, sem precisar de um 401 + refresh. Rotas /api ficam de
 * fora: lá quem renova é o AppClient, ao receber 401.
 *
 * Também barra páginas protegidas para visitantes sem nenhum cookie de
 * sessão, redirecionando para o login antes de servir o app.
 */
export async function pageSession(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET' || req.path.startsWith('/api/') || STATIC_FILE.test(req.path)) return next();

  const cookies = parseCookieHeader(req.headers.cookie);
  const hasAccess = !!cookies[ACCESS_TOKEN_COOKIE];
  const refreshToken = cookies[REFRESH_TOKEN_COOKIE];

  if (!hasAccess && !refreshToken) {
    return isProtectedPage(req.path) ? res.redirect(302, '/auth/login') : next();
  }

  try {
    if (hasAccess) {
      // Já logado tentando abrir o login: vai direto para o app.
      if (GUEST_ONLY_PAGES.includes(req.path) && await hasLoggedUser(req.headers.cookie ?? '')) {
        return res.redirect(302, '/inventory');
      }

      return next();
    }

    const response = await callApi('/api/auth/token/refresh', {
      method: 'POST',
      cookie: serializeCookieHeader({ [REFRESH_TOKEN_COOKIE]: refreshToken }),
    });

    // Só 401 significa "sem sessão"; outra falha da API não derruba a sessão do usuário.
    if (!response.ok && response.status !== 401) return next();

    const setCookies = response.headers.getSetCookie();
    for (const cookie of setCookies) res.append('Set-Cookie', cookie);

    const issued = parseSetCookies(setCookies);

    if (response.ok) {
      cookies[ACCESS_TOKEN_COOKIE] = issued[ACCESS_TOKEN_COOKIE];
      cookies[REFRESH_TOKEN_COOKIE] = issued[REFRESH_TOKEN_COOKIE];
    } else {
      delete cookies[REFRESH_TOKEN_COOKIE];
    }

    // O render desta mesma requisição ainda carrega os cookies antigos no
    // header — reescreve para refletir a sessão nova (ou a ausência dela).
    req.headers.cookie = serializeCookieHeader(cookies);

    if (!response.ok && isProtectedPage(req.path)) return res.redirect(302, '/auth/login');

    return next();
  } catch (error) {
    // API fora do ar: entrega a página mesmo assim; o AppClient trata os erros das chamadas.
    console.error(error);
    return next();
  }
}
