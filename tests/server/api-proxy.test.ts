import express from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApiProxy } from '../../src/server/api-proxy';
import { fakeApi, listen, type RunningServer } from './support/servers';

const api = fakeApi();
let apiServer: RunningServer;
let web: RunningServer;

beforeAll(async () => {
  apiServer = await listen(api.app);
  process.env['API_URL'] = `${apiServer.url}/`;

  const app = express();
  app.use('/api', createApiProxy());
  web = await listen(app);
});

afterAll(async () => {
  await web.close();
  await apiServer.close();
});

beforeEach(() => {
  api.received.length = 0;
  process.env['API_URL'] = `${apiServer.url}/`;
});

describe('api proxy', () => {
  it('forwards method, path, query, body, cookies and language to the API', async () => {
    api.respond((_req, res) => res.status(201).json({ success: true, data: { id: 1 } }));

    const response = await fetch(`${web.url}/api/units?search=a%20b`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: 'access_token=abc', 'accept-language': 'es-MX' },
      body: JSON.stringify({ name: 'Litro' }),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, data: { id: 1 } });

    const [received] = api.received;
    expect(received).toMatchObject({ method: 'POST', url: '/api/units?search=a%20b', body: '{"name":"Litro"}' });
    expect(received.headers).toMatchObject({ cookie: 'access_token=abc', 'content-type': 'application/json', 'accept-language': 'es-MX' });
    expect(received.headers['x-forwarded-for']).toBeTruthy();
  });

  it('keeps every Set-Cookie header from the API', async () => {
    api.respond((_req, res) => {
      res.cookie('access_token', 'new-access', { httpOnly: true, sameSite: 'lax' });
      res.cookie('refresh_token', 'new-refresh', { httpOnly: true, sameSite: 'lax' });
      res.json({ success: true });
    });

    const response = await fetch(`${web.url}/api/auth/login`, { method: 'POST' });
    const cookies = response.headers.getSetCookie();

    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toMatch(/^access_token=new-access;.*HttpOnly/);
    expect(cookies[1]).toMatch(/^refresh_token=new-refresh;.*HttpOnly/);
  });

  it('passes error statuses through untouched', async () => {
    api.respond((_req, res) => res.status(422).json({ success: false, message: { 'en-us': 'Invalid data.' }, data: null }));

    const response = await fetch(`${web.url}/api/units`, { method: 'PUT' });

    expect(response.status).toBe(422);
    expect((await response.json()).message['en-us']).toBe('Invalid data.');
  });

  it('answers 502 in the API envelope when the API is down', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    process.env['API_URL'] = 'http://127.0.0.1:9';

    const response = await fetch(`${web.url}/api/units`);

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ success: false, data: null, message: { 'en-us': 'Service unavailable right now. Please try again.' } });
  });

  it('rejects bodies over 1mb without calling the API', async () => {
    const response = await fetch(`${web.url}/api/units`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'x'.repeat(1024 * 1024 + 1) }),
    });

    expect(response.status).toBe(413);
    expect(api.received).toHaveLength(0);
  });
});
