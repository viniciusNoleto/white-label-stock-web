import { DEFAULT_LOCALE, isSupportedLocale } from '@/libs/i18n';
import type { ApiMessage } from '@/shared/types/api';

export function resolveApiMessage(message: ApiMessage, language: string): string {
  return message[isSupportedLocale(language) ? language : DEFAULT_LOCALE];
}

/** `true` quando o valor é o envelope de erro da API (`{ success: false, message, data }`). */
export function isApiError(value: unknown): value is { success: false; message: ApiMessage; data: null } {
  return typeof value === 'object'
    && value !== null
    && (value as { success?: unknown }).success === false
    && typeof (value as { message?: unknown }).message === 'object'
    && (value as { message?: unknown }).message !== null;
}
