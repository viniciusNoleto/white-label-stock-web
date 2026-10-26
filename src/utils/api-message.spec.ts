import { isApiError, resolveApiMessage } from './api-message';

const message = { 'pt-br': 'Olá', 'es-mx': 'Hola', 'en-us': 'Hello' };

describe('resolveApiMessage', () => {
  it('picks the current language and falls back to pt-br', () => {
    expect(resolveApiMessage(message, 'en-us')).toBe('Hello');
    expect(resolveApiMessage(message, 'fr-fr')).toBe('Olá');
  });
});

describe('isApiError', () => {
  it('recognizes the API error envelope', () => {
    expect(isApiError({ success: false, message, data: null })).toBe(true);
    expect(isApiError({ success: false, message: null, data: null })).toBe(false);
    expect(isApiError(new Error('x'))).toBe(false);
  });
});
