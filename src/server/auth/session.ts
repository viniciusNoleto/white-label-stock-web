import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { users } from '../../../db/schema';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../shared/constants/auth';
import { db } from '../db';
import { createAccessToken } from './access-token';
import { rotateRefreshToken } from './refresh-token';
import { hashToken } from './tokens';

type IssuedToken = { token: string; expiresAt: Date };

export type AuthUser = { id: number; name: string; email: string };

// Em produção os cookies só trafegam por HTTPS. COOKIE_SECURE=false libera
// HTTP puro (ex.: homologação antes de rodar o certbot).
const COOKIE_SECURE = process.env['COOKIE_SECURE']
  ? process.env['COOKIE_SECURE'] === 'true'
  : process.env['NODE_ENV'] === 'production';

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: 'lax',
  path: '/',
} as const;

export function toAuthUser(user: { id: number; name: string; email: string }): AuthUser {
  return { id: user.id, name: user.name, email: user.email };
}

export function parseCookieHeader(header: string | undefined | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key) cookies[key] = decodeURIComponent(rest.join('='));
  }

  return cookies;
}

export function getRequestCookie(req: Request, name: string): string | null {
  return parseCookieHeader(req.headers.cookie)[name] || null;
}

// O cookie de access expira junto com o token: quando o browser o descarta, o
// middleware de páginas (page-session.ts) ou o AppClient (interceptor no
// browser) renovam via refresh_token.
export function setAuthCookies(res: Response, tokens: { accessToken: IssuedToken; refreshToken: IssuedToken }) {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken.token, { ...BASE_COOKIE_OPTIONS, expires: tokens.accessToken.expiresAt });
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken.token, { ...BASE_COOKIE_OPTIONS, expires: tokens.refreshToken.expiresAt });

  return res;
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, BASE_COOKIE_OPTIONS);
  res.clearCookie(REFRESH_TOKEN_COOKIE, BASE_COOKIE_OPTIONS);

  return res;
}

async function rotateSession(refreshToken: string) {
  const rotated = await rotateRefreshToken(refreshToken);
  if (!rotated) return null;

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, rotated.userId))
    .limit(1);

  if (!user) return null;

  const accessToken = await createAccessToken(user.id);

  return { user, accessToken, refreshToken: rotated };
}

// Requisições concorrentes com o mesmo refresh_token (várias abas, chamadas
// paralelas no browser, navegação + fetch) recebem o mesmo par novo de tokens
// em vez de cada uma rotacionar de novo — a segunda rotação cairia na detecção
// de reuso de rotateRefreshToken e revogaria a família inteira (logout forçado).
// Dedupe em memória: vale para uma instância única do processo Node.
const REFRESH_REUSE_WINDOW_MS = 10_000;
const recentRefreshes = new Map<string, ReturnType<typeof rotateSession>>();

export function refreshSession(refreshToken: string) {
  const key = hashToken(refreshToken);

  const existing = recentRefreshes.get(key);
  if (existing) return existing;

  const promise = rotateSession(refreshToken);
  recentRefreshes.set(key, promise);
  setTimeout(() => recentRefreshes.delete(key), REFRESH_REUSE_WINDOW_MS).unref();

  return promise;
}
