import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import express from 'express';
import { vi } from 'vitest';
import { createApiRouter } from '../../../src/server/api';
import { createAccessToken } from '../../../src/server/auth/access-token';
import { hashPassword } from '../../../src/server/auth/password';
import { createRefreshToken } from '../../../src/server/auth/refresh-token';
import { db } from '../../../src/server/db';
import { users } from '../../../db/schema';

let server: Server | null = null;
let baseUrl = '';

async function ensureServer() {
  if (server) return baseUrl;

  const app = express();
  app.use('/api', createApiRouter());

  server = await new Promise<Server>((resolve) => {
    const started = app.listen(0, () => resolve(started));
  });

  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return baseUrl;
}

export async function stopTestServer() {
  if (!server) return;

  await new Promise((resolve) => server!.close(resolve));
  server = null;
}

export type ApiResult = { status: number; body: any; headers: Headers; setCookies: string[] };

/**
 * Faz uma requisição real à API. Autenticada por padrão (cria um usuário e um
 * access token); passe `cookie: null` para anônimo ou um cookie próprio.
 */
export async function api(method: string, path: string, body?: unknown, options: { cookie?: string | null; rawBody?: string } = {}): Promise<ApiResult> {
  const url = await ensureServer();
  const cookie = options.cookie === undefined ? sessionCookie : options.cookie;

  const response = await fetch(url + path, {
    method,
    headers: {
      ...(body !== undefined || options.rawBody !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: options.rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
  });

  return {
    status: response.status,
    body: await response.json(),
    headers: response.headers,
    setCookies: response.headers.getSetCookie(),
  };
}

/** `nome=valor` de cada Set-Cookie, prontos para reenviar no header Cookie. */
export function cookiesFrom(setCookies: string[]) {
  return setCookies.map((cookie) => cookie.split(';')[0]).join('; ');
}

export function cookieValue(setCookies: string[], name: string) {
  return setCookies.find((cookie) => cookie.startsWith(`${name}=`))?.split(';')[0].slice(name.length + 1) ?? null;
}

export async function createUser(overrides: Partial<typeof users.$inferInsert> = {}, password = 'secret123') {
  const [user] = await db.insert(users).values({
    name: 'Tester',
    email: 'tester@example.com',
    password_hash: await hashPassword(password),
    ...overrides,
  }).returning();

  return user;
}

let sessionCookie: string | null = null;

/** Chamado no beforeEach (depois do TRUNCATE): sessão válida usada por padrão em `api()`. */
export async function startTestSession() {
  sessionCookie = await authCookie();
}

export async function authCookie() {
  const [existing] = await db.select().from(users).limit(1);

  const user = existing ?? await createUser();
  const access = await createAccessToken(user.id);
  const refresh = await createRefreshToken(user.id);

  return `access_token=${access.token}; refresh_token=${refresh.token}`;
}

/**
 * Faz a chamada do método do db falhar dentro da rota, exercitando o ramo 500.
 * Para `select`, pula a consulta do middleware de autenticação (`requireUser`).
 */
export function failNextDbCall(method: 'select' | 'insert' | 'update' | 'delete' | 'transaction', { skip = method === 'select' ? 1 : 0 } = {}) {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  const original = (db[method] as (...args: unknown[]) => unknown).bind(db);
  let calls = 0;

  vi.spyOn(db, method).mockImplementation(((...args: unknown[]) => {
    calls++;
    if (calls === skip + 1) throw new Error('db down');
    return original(...args);
  }) as never);
}
