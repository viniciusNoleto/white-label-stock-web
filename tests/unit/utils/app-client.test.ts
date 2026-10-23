import { describe, expect, it, vi } from 'vitest';
import { appClient } from '@/utils/app-client';
import { fail, ok } from '../../support/fetch';

function stubFetch(payload: unknown) {
  const fn = vi.fn(async () => new Response(JSON.stringify(payload)));
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('appClient', () => {
  it('GET forwards the abort signal and returns the envelope', async () => {
    const fetchFn = stubFetch(ok([1]));
    const signal = new AbortController().signal;

    await expect(appClient.get('/api/x', { signal })).resolves.toEqual(ok([1]));
    expect(fetchFn).toHaveBeenCalledWith('/api/x', { signal });
  });

  it('GET works without options', async () => {
    const fetchFn = stubFetch(ok(null));

    await appClient.get('/api/x');

    expect(fetchFn).toHaveBeenCalledWith('/api/x', { signal: undefined });
  });

  it.each(['post', 'put', 'patch'] as const)('%s sends a JSON body', async (method) => {
    const fetchFn = stubFetch(ok({ id: 1 }));

    await appClient[method]('/api/x', { body: { a: 1 } });

    expect(fetchFn).toHaveBeenCalledWith('/api/x', expect.objectContaining({
      method: method.toUpperCase(),
      headers: { 'Content-Type': 'application/json' },
      body: '{"a":1}',
    }));
  });

  it('DELETE sends the method', async () => {
    const fetchFn = stubFetch(ok(null));

    await appClient.delete('/api/x/1');

    expect(fetchFn).toHaveBeenCalledWith('/api/x/1', { method: 'DELETE' });
  });

  it('rejects with the envelope when success is false', async () => {
    stubFetch(fail('nope'));

    await expect(appClient.get('/api/x')).rejects.toEqual(fail('nope'));
  });
});
