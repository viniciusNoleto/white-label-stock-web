import { vi } from 'vitest';

export type MockRequest = { method: string; url: string; path: string; search: URLSearchParams; body: any };
type Handler = unknown | ((req: MockRequest) => unknown);

export const msg = (text: string) => ({ 'pt-br': text, 'es-mx': text, 'en-us': text });

export const ok = <T,>(data: T, text = 'OK') => ({ success: true, message: msg(text), data });

export const fail = (text: string) => ({ success: false, message: msg(text), data: null });

/**
 * Stubs global fetch. Routes are keyed by "METHOD /path" (query string ignored).
 * Handlers may be a JSON body or a function receiving the parsed request.
 */
export function mockFetch(routes: Record<string, Handler>) {
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost');
    const method = (init?.method ?? 'GET').toUpperCase();
    const key = `${method} ${url.pathname}`;
    const req: MockRequest = {
      method,
      url: url.toString(),
      path: url.pathname,
      search: url.searchParams,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };

    if (!(key in routes)) throw new Error(`Unexpected fetch: ${key}`);

    const handler = routes[key];
    const payload = typeof handler === 'function' ? await (handler as (r: MockRequest) => unknown)(req) : handler;

    return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });
  });

  vi.stubGlobal('fetch', fn);

  return {
    fn,
    calls: (key: string) => fn.mock.calls
      .map(([input, init]) => ({ url: new URL(String(input), 'http://localhost'), init }))
      .filter(({ url, init }) => `${(init?.method ?? 'GET').toUpperCase()} ${url.pathname}` === key)
      .map(({ url, init }) => ({ search: url.searchParams, body: init?.body ? JSON.parse(String(init.body)) : undefined })),
  };
}

export function page<T>(items: T[], meta: Partial<{ page: number; per_page: number; total: number; last_page: number }> = {}) {
  return ok({ items, meta: { page: 1, per_page: 15, total: items.length, last_page: 1, ...meta } });
}
