import type { NextFunction, Request, Response } from 'express';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../shared/constants/auth';
import { MESSAGES, jsonError } from '../utils/api';
import { getUserFromAccessToken } from './access-token';
import { type AuthUser, clearAuthCookies, getRequestCookie, parseCookieHeader, refreshSession, setAuthCookies, toAuthUser } from './session';

export type AuthLocals = { user: AuthUser };

export async function getRequestUser(req: Request): Promise<AuthUser | null> {
  const token = getRequestCookie(req, ACCESS_TOKEN_COOKIE);
  if (!token) return null;

  const user = await getUserFromAccessToken(token);
  return user ? toAuthUser(user) : null;
}

/**
 * Protege rotas da API. Sem access token válido responde 401 — o AppClient
 * (browser) entende o 401 como "renove a sessão via refresh_token e repita".
 */
export async function requireUser(req: Request, res: Response<unknown, AuthLocals>, next: NextFunction) {
  try {
    const user = await getRequestUser(req);
    if (!user) return jsonError(res, MESSAGES.unauthorized, 401);

    res.locals.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

const PROTECTED_PAGE_PREFIXES = ['/inventory'];

const GUEST_ONLY_PAGES = ['/auth/login'];

const STATIC_FILE = /\.[a-z0-9]+$/i;

function isProtectedPage(path: string) {
  return PROTECTED_PAGE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * Equivalente ao proxy.ts do rentable para as navegações de página.
 *
 * Quando o cookie de access já expirou (o browser o descarta junto com o
 * token) mas ainda há refresh_token, renova a sessão ANTES de entregar a
 * página — assim o primeiro request da página no browser já sai com um
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

  if (hasAccess) {
    // Já logado tentando abrir o login: vai direto para o app.
    if (GUEST_ONLY_PAGES.includes(req.path) && await getRequestUser(req).catch(() => null)) {
      return res.redirect(302, '/inventory');
    }

    return next();
  }

  if (!refreshToken) return next();

  try {
    const session = await refreshSession(refreshToken);

    if (!session) {
      clearAuthCookies(res);
      delete cookies[REFRESH_TOKEN_COOKIE];
    } else {
      setAuthCookies(res, session);
      cookies[ACCESS_TOKEN_COOKIE] = session.accessToken.token;
      cookies[REFRESH_TOKEN_COOKIE] = session.refreshToken.token;
    }

    // O render desta mesma requisição ainda carrega os cookies antigos no
    // header — reescreve para refletir a sessão nova (ou a ausência dela).
    req.headers.cookie = Object.entries(cookies)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('; ');

    if (!session && isProtectedPage(req.path)) return res.redirect(302, '/auth/login');

    return next();
  } catch (error) {
    return next(error);
  }
}
