import express from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { pageSession } from '../../src/server/page-session';
import { fakeApi, listen, type RunningServer } from './support/servers';

const api = fakeApi();
let apiServer: RunningServer;
let web: RunningServer;

beforeAll(async () => {
  apiServer = await listen(api.app);

  const app = express();
  app.use(pageSession);
  app.use((req, res) => res.json({ cookie: req.headers.cookie ?? null }));
  web = await listen(app);
});

afterAll(async () => {
  await web.close();
  await apiServer.close();
});

beforeEach(() => {
  api.received.length = 0;
  process.env['API_URL'] = apiServer.url;
});

async function page(path: string, cookie?: string) {
  const response = await fetch(`${web.url}${path}`, { redirect: 'manual', headers: cookie ? { cookie } : {} });

  return {
    status: response.status,
    location: response.headers.get('location'),
    setCookies: response.headers.getSetCookie(),
    body: response.status === 200 ? await response.json() : null,
  };
}

describe('page session middleware', () => {
  it('redirects anonymous visitors away from protected pages without calling the API', async () => {
    expect(await page('/inventory/items')).toMatchObject({ status: 302, location: '/auth/login' });
    expect((await page('/')).status).toBe(200);
    expect(api.received).toHaveLength(0);
  });

  it('refreshes the session on the API before rendering when only the refresh token is left', async () => {
    api.respond((_req, res) => {
      res.json({
        success: true,
        data: { user: { id: 1 }, access_token: 'new-access', refresh_token: 'new-refresh', expires_in: 900, refresh_expires_in: 2592000 },
      });
    });

    const result = await page('/inventory/items', 'language=pt-br; refresh_token=old-refresh');

    expect(api.received[0]).toMatchObject({ method: 'POST', url: '/api/auth/token/refresh' });
    expect(JSON.parse(api.received[0].body)).toEqual({ refresh_token: 'old-refresh' });
    expect(api.received[0].headers['content-type']).toBe('application/json');
    expect(api.received[0].headers['cookie']).toBeUndefined();
    expect(result.status).toBe(200);
    expect(result.setCookies).toEqual([
      'access_token=new-access; Path=/; Max-Age=900; SameSite=Lax',
      'refresh_token=new-refresh; Path=/; Max-Age=2592000; SameSite=Lax',
    ]);
    // o render desta mesma requisição já enxerga os tokens novos
    expect(result.body.cookie).toBe('language=pt-br; refresh_token=new-refresh; access_token=new-access');
  });

  it('sends the visitor to the login and clears the cookies when the refresh token is rejected', async () => {
    api.respond((_req, res) => res.status(401).json({ success: false, data: null }));

    const result = await page('/inventory/items', 'refresh_token=stolen');

    expect(result).toMatchObject({ status: 302, location: '/auth/login' });
    expect(result.setCookies).toEqual([
      'access_token=; Path=/; Max-Age=0; SameSite=Lax',
      'refresh_token=; Path=/; Max-Age=0; SameSite=Lax',
    ]);
  });

  it('keeps the session when the refresh fails for another reason', async () => {
    api.respond((_req, res) => res.status(500).json({ success: false, data: null }));

    const result = await page('/inventory/items', 'refresh_token=x');

    expect(result.status).toBe(200);
    expect(result.setCookies).toHaveLength(0);
  });

  it('keeps serving public pages (without the dead refresh token) when the refresh is rejected', async () => {
    api.respond((_req, res) => res.status(401).json({ success: false, data: null }));

    const result = await page('/', 'language=es-mx; refresh_token=stolen');

    expect(result.status).toBe(200);
    expect(result.body.cookie).toBe('language=es-mx');
  });

  it('sends a logged user away from the login page', async () => {
    api.respond((_req, res) => res.json({ success: true, data: { user: { id: 1 } } }));

    expect(await page('/auth/login', 'access_token=valid')).toMatchObject({ status: 302, location: '/inventory' });
    expect(api.received[0]).toMatchObject({ method: 'GET', url: '/api/auth/me' });
    expect(api.received[0].headers['authorization']).toBe('Bearer valid');
  });

  it('sends a logged user away from the registration page', async () => {
    api.respond((_req, res) => res.json({ success: true, data: { user: { id: 1 } } }));

    expect(await page('/auth/register', 'access_token=valid')).toMatchObject({ status: 302, location: '/inventory' });
  });

  it('lets a visitor open the registration page', async () => {
    expect((await page('/auth/register')).status).toBe(200);
    expect(api.received).toHaveLength(0);
  });

  it('lets the login page render when the access token is no longer valid', async () => {
    api.respond((_req, res) => res.status(401).json({ success: false, data: null }));

    expect((await page('/auth/login', 'access_token=expired')).status).toBe(200);
  });

  it('serves the page when the API is down', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    process.env['API_URL'] = 'http://127.0.0.1:9';

    expect((await page('/inventory/items', 'refresh_token=x')).status).toBe(200);
  });

  it('ignores API calls and static files', async () => {
    expect((await page('/api/units', 'refresh_token=x')).setCookies).toHaveLength(0);
    expect((await page('/main.js', 'refresh_token=x')).setCookies).toHaveLength(0);
    expect(api.received).toHaveLength(0);
  });
});
