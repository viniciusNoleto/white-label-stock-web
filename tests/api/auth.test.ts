import { eq } from 'drizzle-orm';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { describe, expect, it } from 'vitest';
import { accessTokens, refreshTokens } from '../../db/schema';
import { pageSession } from '../../src/server/auth/middleware';
import { createRefreshToken, rotateRefreshToken } from '../../src/server/auth/refresh-token';
import { refreshSession } from '../../src/server/auth/session';
import { hashToken } from '../../src/server/auth/tokens';
import { db } from '../../src/server/db';
import { api, cookieValue, cookiesFrom, createUser } from './support/http';

async function login(email = 'ana@example.com', password = 'secret123') {
  return api('POST', '/api/auth/login', { email, password }, { cookie: null });
}

describe('POST /api/auth/login', () => {
  it('signs in and sets both session cookies as httpOnly', async () => {
    await createUser({ name: 'Ana', email: 'ana@example.com' });

    const { status, body, setCookies } = await login('  ANA@example.com ');

    expect(status).toBe(200);
    expect(body.data).toEqual({ user: { id: 2, name: 'Ana', email: 'ana@example.com' } });
    expect(body.message['pt-br']).toBe('Login realizado com sucesso.');
    expect(setCookies).toHaveLength(2);
    expect(setCookies.every((cookie) => /HttpOnly/i.test(cookie) && /SameSite=Lax/i.test(cookie) && /Path=\//.test(cookie))).toBe(true);
    // Só o hash vai para o banco — nunca o token cru.
    const raw = cookieValue(setCookies, 'access_token')!;
    const [row] = await db.select().from(accessTokens).where(eq(accessTokens.token_hash, hashToken(raw)));
    expect(row).toBeTruthy();
  });

  it('rejects wrong credentials with the same message for unknown e-mails', async () => {
    await createUser({ email: 'ana@example.com' });

    const wrongPassword = await login('ana@example.com', 'nope');
    const unknownEmail = await login('ghost@example.com');

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.message).toEqual(unknownEmail.body.message);
    expect(wrongPassword.setCookies).toHaveLength(0);
  });

  it('validates the payload', async () => {
    expect((await api('POST', '/api/auth/login', { email: 'a@b.c' }, { cookie: null })).status).toBe(422);
  });
});

describe('GET /api/auth/me', () => {
  it('returns null for anonymous visitors without triggering a refresh', async () => {
    const { status, body } = await api('GET', '/api/auth/me', undefined, { cookie: null });

    expect(status).toBe(200);
    expect(body.data).toEqual({ user: null });
  });

  it('returns 401 when only the refresh token is left (client should refresh)', async () => {
    expect((await api('GET', '/api/auth/me', undefined, { cookie: 'refresh_token=whatever' })).status).toBe(401);
  });

  it('returns the logged user', async () => {
    await createUser({ name: 'Ana', email: 'ana@example.com' });
    const { setCookies } = await login();

    const { body } = await api('GET', '/api/auth/me', undefined, { cookie: cookiesFrom(setCookies) });

    expect(body.data.user).toMatchObject({ name: 'Ana', email: 'ana@example.com' });
  });
});

describe('protected API routes', () => {
  it.each(['/api/units', '/api/item-categories', '/api/storages', '/api/inventory-items'])('%s requires a session', async (path) => {
    const { status, body } = await api('GET', path, undefined, { cookie: null });

    expect(status).toBe(401);
    expect(body).toMatchObject({ success: false, data: null, message: { 'pt-br': 'Você precisa entrar para continuar.' } });
  });

  it('rejects an expired access token', async () => {
    await createUser({ email: 'ana@example.com' });
    const { setCookies } = await login();
    await db.update(accessTokens).set({ expires_at: new Date(Date.now() - 1000) });

    expect((await api('GET', '/api/units', undefined, { cookie: cookiesFrom(setCookies) })).status).toBe(401);
  });
});

describe('POST /api/auth/token/refresh', () => {
  it('rotates the refresh token and issues a new access token', async () => {
    await createUser({ email: 'ana@example.com' });
    const first = await login();

    const refreshed = await api('POST', '/api/auth/token/refresh', undefined, { cookie: cookiesFrom(first.setCookies) });

    expect(refreshed.status).toBe(200);
    expect(cookieValue(refreshed.setCookies, 'refresh_token')).not.toBe(cookieValue(first.setCookies, 'refresh_token'));
    expect(cookieValue(refreshed.setCookies, 'access_token')).not.toBe(cookieValue(first.setCookies, 'access_token'));

    const [old] = await db.select().from(refreshTokens).where(eq(refreshTokens.token_hash, hashToken(cookieValue(first.setCookies, 'refresh_token')!)));
    expect(old.revoked).toBe(true);
  });

  it('clears the cookies when there is no valid refresh token', async () => {
    const { status, setCookies } = await api('POST', '/api/auth/token/refresh', undefined, { cookie: 'refresh_token=invalid' });

    expect(status).toBe(401);
    expect(setCookies.map((cookie) => cookie.split('=')[0]).sort()).toEqual(['access_token', 'refresh_token']);
    expect(setCookies.every((cookie) => /Expires=Thu, 01 Jan 1970/.test(cookie))).toBe(true);
  });

  it('gives concurrent refreshes with the same token the same new session', async () => {
    const user = await createUser({ email: 'ana@example.com' });
    const { token } = await createRefreshToken(user.id);

    const [a, b] = await Promise.all([refreshSession(token), refreshSession(token)]);

    expect(a?.refreshToken.token).toBe(b?.refreshToken.token);
    expect(await db.select().from(refreshTokens).where(eq(refreshTokens.revoked, false))).toHaveLength(2);
  });

  it('revokes the whole family when an already rotated token is reused', async () => {
    const user = await createUser({ email: 'ana@example.com' });
    const original = await createRefreshToken(user.id);

    const rotated = await rotateRefreshToken(original.token);
    expect(rotated).not.toBeNull();

    // alguém reapresenta o token antigo (já trocado): sinal de roubo
    expect(await rotateRefreshToken(original.token)).toBeNull();

    // até o token "legítimo" mais novo deixa de funcionar
    expect(await rotateRefreshToken(rotated!.token)).toBeNull();
  });

  it('rejects expired refresh tokens', async () => {
    const user = await createUser({ email: 'ana@example.com' });
    const { token } = await createRefreshToken(user.id);
    await db.update(refreshTokens).set({ expires_at: new Date(Date.now() - 1000) });

    expect(await rotateRefreshToken(token)).toBeNull();
  });
});

describe('POST /api/auth/logout', () => {
  it('revokes both tokens and clears the cookies', async () => {
    await createUser({ email: 'ana@example.com' });
    const { setCookies } = await login();
    const cookie = cookiesFrom(setCookies);

    const logout = await api('POST', '/api/auth/logout', undefined, { cookie });

    expect(logout.status).toBe(200);
    expect(logout.setCookies).toHaveLength(2);
    expect((await api('GET', '/api/units', undefined, { cookie })).status).toBe(401);
    expect((await api('POST', '/api/auth/token/refresh', undefined, { cookie })).status).toBe(401);
  });
});

describe('page session middleware', () => {
  async function page(path: string, cookie?: string) {
    const app = express();
    app.use(pageSession);
    app.use((req, res) => res.json({ cookie: req.headers.cookie ?? null }));

    const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
      const started = app.listen(0, () => resolve(started));
    });

    try {
      const response = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}${path}`, {
        redirect: 'manual',
        headers: cookie ? { cookie } : {},
      });

      return {
        status: response.status,
        location: response.headers.get('location'),
        setCookies: response.headers.getSetCookie(),
        body: response.status === 200 ? await response.json() : null,
      };
    } finally {
      server.close();
    }
  }

  it('redirects anonymous visitors away from protected pages', async () => {
    expect(await page('/inventory/items')).toMatchObject({ status: 302, location: '/auth/login' });
    expect((await page('/')).status).toBe(200);
  });

  it('refreshes the session before rendering when only the refresh token is left', async () => {
    const user = await createUser({ email: 'ana@example.com' });
    const { token } = await createRefreshToken(user.id);

    const result = await page('/inventory/items', `refresh_token=${token}`);

    expect(result.status).toBe(200);
    expect(result.setCookies.map((cookie) => cookie.split('=')[0]).sort()).toEqual(['access_token', 'refresh_token']);
    // o render desta mesma requisição já enxerga os tokens novos
    expect(result.body.cookie).toContain(`access_token=${cookieValue(result.setCookies, 'access_token')}`);
  });

  it('sends a logged user away from the login page', async () => {
    await createUser({ email: 'ana@example.com' });
    const { setCookies } = await login();

    expect(await page('/auth/login', cookiesFrom(setCookies))).toMatchObject({ status: 302, location: '/inventory' });
  });

  it('ignores API calls and static files', async () => {
    expect((await page('/api/units', 'refresh_token=x')).setCookies).toHaveLength(0);
    expect((await page('/main.js', 'refresh_token=x')).setCookies).toHaveLength(0);
  });
});
