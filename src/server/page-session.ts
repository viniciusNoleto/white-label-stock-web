import type { NextFunction, Request, Response } from 'express';
import type { IAuthSession } from '../resources/auth/models/AuthUser';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../shared/constants/auth';
import type { ApiResponse } from '../shared/types/api';
import { serializeAuthCookie } from '../shared/utils/auth-cookie';
import { apiUrl } from './utils/api';
import { parseCookieHeader, serializeCookieHeader } from './utils/cookies';

const PROTECTED_PAGE_PREFIXES = ['/inventory'];

const GUEST_ONLY_PAGES = ['/auth/login'];

const STATIC_FILE = /\.[a-z0-9]+$/i;

const API_TIMEOUT_MS = 10_000;

function isProtectedPage(path: string) {
  return PROTECTED_PAGE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function callApi(path: string, init: { method: string; headers?: Record<string, string>; body?: unknown }) {
  return fetch(`${apiUrl()}${path}`, {
    method: init.method,
    headers: {
      accept: 'application/json',
      ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
      ...init.headers,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
}

async function hasLoggedUser(accessToken: string) {
  const response = await callApi('/api/auth/me', { method: 'GET', headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return false;

  const body = await response.json();
  return !!body?.data?.user;
}

/**
 * Equivalente ao proxy.ts do Next (white-label-utility-list) para as navegações de página.
 *
 * Os tokens vivem em cookies comuns da origem do web, com `Max-Age` igual à
 * validade de cada token. Quando o cookie de access já expirou mas ainda há
 * refresh_token, renova a sessão na API (refresh_token no corpo) ANTES de
 * entregar a página e grava o par novo nos cookies — assim o primeiro request
 * da página no browser já sai com um access token válido, sem precisar de um
 * 401 + refresh. Rotas /api ficam de fora: lá quem renova é o AppClient, ao
 * receber 401.
 *
 * Também barra páginas protegidas para visitantes sem nenhum cookie de
 * sessão, redirecionando para o login antes de servir o app.
 */
export async function pageSession(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET' || req.path.startsWith('/api/') || STATIC_FILE.test(req.path)) return next();

  const cookies = parseCookieHeader(req.headers.cookie);
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  const refreshToken = cookies[REFRESH_TOKEN_COOKIE];

  if (!accessToken && !refreshToken) {
    return isProtectedPage(req.path) ? res.redirect(302, '/auth/login') : next();
  }

  try {
    if (accessToken) {
      // Já logado tentando abrir o login: vai direto para o app.
      if (GUEST_ONLY_PAGES.includes(req.path) && await hasLoggedUser(accessToken)) {
        return res.redirect(302, '/inventory');
      }

      return next();
    }

    const response = await callApi('/api/auth/token/refresh', { method: 'POST', body: { refresh_token: refreshToken } });

    // Só 401 significa "sem sessão"; outra falha da API não derruba a sessão do usuário.
    if (!response.ok && response.status !== 401) return next();

    if (response.ok) {
      const session = ((await response.json()) as ApiResponse<IAuthSession>).data;

      res.append('Set-Cookie', serializeAuthCookie(ACCESS_TOKEN_COOKIE, session.access_token, { maxAge: session.expires_in, secure: req.secure }));
      res.append('Set-Cookie', serializeAuthCookie(REFRESH_TOKEN_COOKIE, session.refresh_token, { maxAge: session.refresh_expires_in, secure: req.secure }));

      cookies[ACCESS_TOKEN_COOKIE] = session.access_token;
      cookies[REFRESH_TOKEN_COOKIE] = session.refresh_token;
    } else {
      res.append('Set-Cookie', serializeAuthCookie(ACCESS_TOKEN_COOKIE, '', { maxAge: 0, secure: req.secure }));
      res.append('Set-Cookie', serializeAuthCookie(REFRESH_TOKEN_COOKIE, '', { maxAge: 0, secure: req.secure }));

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
