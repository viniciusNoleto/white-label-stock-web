import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AppClient, AppEvents, authRefreshInterceptor } from './app-client';

const ok = <T>(data: T) => ({ success: true, message: { 'pt-br': 'ok', 'es-mx': 'ok', 'en-us': 'ok' }, data });
const unauthorized = { success: false, message: { 'pt-br': 'Entre', 'es-mx': 'Entra', 'en-us': 'Sign in' }, data: null };
const session = (access: string, refresh: string) => ok({ user: { id: 1, name: 'Ana', email: 'ana@example.com' }, access_token: access, refresh_token: refresh, expires_in: 900, refresh_expires_in: 2592000 });

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/`;
}

function cookie(name: string) {
  return document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] ?? null;
}

function clearCookies() {
  for (const name of ['access_token', 'refresh_token']) document.cookie = `${name}=; path=/; max-age=0`;
}

describe('AppClient + authRefreshInterceptor', () => {
  let client: AppClient;
  let http: HttpTestingController;
  let events: AppEvents;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authRefreshInterceptor])), provideHttpClientTesting()],
    });

    client = TestBed.inject(AppClient);
    http = TestBed.inject(HttpTestingController);
    events = TestBed.inject(AppEvents);

    clearCookies();
    setCookie('access_token', 'access-1');
    setCookie('refresh_token', 'refresh-1');
  });

  afterEach(() => {
    http.verify();
    clearCookies();
  });

  it('sends the access token as a Bearer header', async () => {
    const result = firstValueFrom(client.get('/api/units'));

    const req = http.expectOne('/api/units');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-1');
    req.flush(ok([]));

    await result;
  });

  it('sends no Authorization header without a session or to the login', async () => {
    const login = firstValueFrom(client.post('/api/auth/login', { body: {} }));
    const loginReq = http.expectOne('/api/auth/login');
    expect(loginReq.request.headers.has('Authorization')).toBe(false);
    loginReq.flush(ok(null));
    await login;

    clearCookies();

    const units = firstValueFrom(client.get('/api/units'));
    const unitsReq = http.expectOne('/api/units');
    expect(unitsReq.request.headers.has('Authorization')).toBe(false);
    unitsReq.flush(ok([]));
    await units;
  });

  it('serializes query params, skipping empty values', async () => {
    const result = firstValueFrom(client.get<number[]>('/api/inventory-items', { query: { search: '', page: 2, per_page: 15 } }));

    http.expectOne('/api/inventory-items?page=2&per_page=15').flush(ok([1]));

    expect((await result).data).toEqual([1]);
  });

  it('throws the API envelope on errors', async () => {
    const result = firstValueFrom(client.post('/api/units', { body: {} }));

    http.expectOne('/api/units').flush({ success: false, message: unauthorized.message, data: null }, { status: 422, statusText: 'Unprocessable' });

    await expect(result).rejects.toMatchObject({ success: false, message: unauthorized.message });
  });

  it('refreshes the session once on 401 and replays the request with the new token', async () => {
    const result = firstValueFrom(client.get<string>('/api/units'));

    http.expectOne('/api/units').flush(unauthorized, { status: 401, statusText: 'Unauthorized' });

    const refresh = http.expectOne({ method: 'POST', url: '/api/auth/token/refresh' });
    expect(refresh.request.body).toEqual({ refresh_token: 'refresh-1' });
    expect(refresh.request.headers.has('Authorization')).toBe(false);
    refresh.flush(session('access-2', 'refresh-2'));

    const replay = http.expectOne('/api/units');
    expect(replay.request.headers.get('Authorization')).toBe('Bearer access-2');
    replay.flush(ok('after refresh'));

    expect((await result).data).toBe('after refresh');
    expect([cookie('access_token'), cookie('refresh_token')]).toEqual(['access-2', 'refresh-2']);
  });

  it('does not call the refresh route without a refresh token', async () => {
    const expired = vi.fn();
    events.sessionExpired$.subscribe(expired);
    clearCookies();

    const result = firstValueFrom(client.get('/api/units'));

    http.expectOne('/api/units').flush(unauthorized, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toMatchObject({ success: false });
    http.expectNone('/api/auth/token/refresh');
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it('shares a single refresh between parallel 401s', async () => {
    const units = firstValueFrom(client.get('/api/units'));
    const storages = firstValueFrom(client.get('/api/storages'));

    http.expectOne('/api/units').flush(unauthorized, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/storages').flush(unauthorized, { status: 401, statusText: 'Unauthorized' });

    const refreshes = http.match('/api/auth/token/refresh');
    expect(refreshes).toHaveLength(1);
    refreshes[0].flush(session('access-2', 'refresh-2'));

    http.expectOne('/api/units').flush(ok('u'));
    http.expectOne('/api/storages').flush(ok('s'));

    expect([(await units).data, (await storages).data]).toEqual(['u', 's']);
  });

  it('emits sessionExpired$ when the refresh fails', async () => {
    const expired = vi.fn();
    events.sessionExpired$.subscribe(expired);

    const result = firstValueFrom(client.get('/api/units'));

    http.expectOne('/api/units').flush(unauthorized, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/auth/token/refresh').flush(unauthorized, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toMatchObject({ success: false });
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it('never refreshes for the login request itself', async () => {
    const result = firstValueFrom(client.post('/api/auth/login', { body: {} }));

    http.expectOne('/api/auth/login').flush(unauthorized, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toMatchObject({ success: false });
    http.expectNone('/api/auth/token/refresh');
  });
});
