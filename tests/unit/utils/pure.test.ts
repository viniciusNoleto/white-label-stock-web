import { describe, expect, it } from 'vitest';
import { resolveApiMessage } from '@/utils/apiMessage';
import { chain, mapper } from '@/utils/chain';
import { getter } from '@/utils/data';
import { formatCpf, formatPhone } from '@/utils/format';
import { cn as uiCn } from '@/utils/ui';
import { cn as libCn } from '@/libs/utils';
import { getCookie, removeCookie, setCookie } from '@/utils/cookies';

describe('resolveApiMessage', () => {
  const message = { 'pt-br': 'Olá', 'es-mx': 'Hola', 'en-us': 'Hello' };

  it.each([['pt-br', 'Olá'], ['es-mx', 'Hola'], ['en-us', 'Hello']])('resolves %s', (lang, expected) => {
    expect(resolveApiMessage(message, lang)).toBe(expected);
  });

  it('falls back to pt-br for unsupported languages', () => {
    expect(resolveApiMessage(message, 'fr')).toBe('Olá');
  });
});

describe('chain / mapper', () => {
  it('pipes a promise through transformations', async () => {
    const result = await chain(Promise.resolve(2), (n: number) => n * 3);

    expect(result).toBe(6);
  });

  it('applies multiple steps in order', async () => {
    const result = await chain(Promise.resolve('a'), (s: string) => `${s}b`, (s: string) => `${s}c`);

    expect(result).toBe('abc');
  });

  it('mapper replaces response data keeping the envelope', async () => {
    const response = { data: [1, 2], message: { 'pt-br': 'ok', 'es-mx': 'ok', 'en-us': 'ok' } };

    const mapped = await chain(Promise.resolve(response), mapper<number[], number>(res => res.data.length));

    expect(mapped).toEqual({ data: 2, message: response.message });
  });
});

describe('getter', () => {
  const obj = { id: 1, nested: { name: 'x' } };

  it('returns the object when no hook is given', () => {
    expect(getter(obj)).toBe(obj);
  });

  it('returns falsy objects untouched', () => {
    expect(getter(null as unknown as object, 'id')).toBeNull();
  });

  it('resolves string paths', () => {
    expect(getter(obj, 'nested.name')).toBe('x');
  });

  it('resolves function hooks', () => {
    expect(getter(obj, (o: typeof obj) => o.id + 1)).toBe(2);
  });
});

describe('formatCpf', () => {
  it.each([
    [null, '—'],
    [undefined, '—'],
    ['', '—'],
    ['12345678901', '123.456.789-01'],
    ['123.456.789-01', '123.456.789-01'],
    ['123', '123'],
  ])('formats %s → %s', (input, expected) => {
    expect(formatCpf(input)).toBe(expected);
  });
});

describe('formatPhone', () => {
  it.each([
    [null, '—'],
    ['5511987654321', '+55 (11) 98765-4321'],
    ['11987654321', '(11) 98765-4321'],
    ['1133334444', '(11) 3333-4444'],
    ['999', '999'],
  ])('formats %s → %s', (input, expected) => {
    expect(formatPhone(input)).toBe(expected);
  });
});

describe('cn', () => {
  it.each([['utils/ui', uiCn], ['libs/utils', libCn]])('%s merges tailwind classes', (_, cn) => {
    expect(cn('p-2', false && 'hidden', 'p-4', ['text-sm'])).toBe('p-4 text-sm');
  });
});

describe('cookies', () => {
  it('sets, reads and removes cookies', () => {
    expect(getCookie('token')).toBeNull();

    setCookie('token', 'abc');
    expect(getCookie('token')).toBe('abc');

    setCookie('token', 'def', 1);
    expect(getCookie('token')).toBe('def');

    removeCookie('token');
    expect(getCookie('token')).toBeNull();
  });
});
