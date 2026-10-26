import type { Response } from 'express';
import type { ApiMessage, ApiResponse } from '../../shared/types/api';

export function msg(pt: string, es: string, en: string): ApiMessage {
  return { 'pt-br': pt, 'es-mx': es, 'en-us': en };
}

export const MESSAGES = {
  success: msg('Operação realizada com sucesso.', 'Operación realizada con éxito.', 'Operation completed successfully.'),
  unauthorized: msg('Você precisa entrar para continuar.', 'Debes iniciar sesión para continuar.', 'You need to sign in to continue.'),
  notFound: msg('Registro não encontrado.', 'Registro no encontrado.', 'Record not found.'),
  serverError: msg('Erro inesperado. Tente novamente.', 'Error inesperado. Inténtalo de nuevo.', 'Unexpected error. Please try again.'),
  invalidPayload: msg('Dados inválidos.', 'Datos inválidos.', 'Invalid data.'),
} as const;

export function jsonOk<T>(res: Response, data: T, message: ApiMessage = MESSAGES.success, status = 200) {
  return res.status(status).json({ success: true, message, data } satisfies ApiResponse<T>);
}

export function jsonError(res: Response, message: ApiMessage, status = 400) {
  return res.status(status).json({ success: false, message, data: null } satisfies ApiResponse<null>);
}

/** Converte o `:id` da rota em inteiro positivo; `null` quando não é um id válido. */
export function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function isPostgresError(error: unknown, code: string): boolean {
  if (typeof error !== 'object' || error === null) return false;
  if ('code' in error && (error as { code?: string }).code === code) return true;

  const cause = (error as { cause?: unknown }).cause;
  return typeof cause === 'object' && cause !== null && 'code' in cause && (cause as { code?: string }).code === code;
}
