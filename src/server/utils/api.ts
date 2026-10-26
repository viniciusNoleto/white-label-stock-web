import type { Response } from 'express';
import type { ApiMessage, ApiResponse } from '../../shared/types/api';

export function msg(pt: string, es: string, en: string): ApiMessage {
  return { 'pt-br': pt, 'es-mx': es, 'en-us': en };
}

export const MESSAGES = {
  apiUnavailable: msg(
    'Serviço indisponível no momento. Tente novamente.',
    'Servicio no disponible en este momento. Inténtalo de nuevo.',
    'Service unavailable right now. Please try again.',
  ),
  invalidPayload: msg('Dados inválidos.', 'Datos inválidos.', 'Invalid data.'),
} as const;

/** Mesmo envelope da API — usado só quando o próprio proxy falha (API fora do ar, corpo grande demais). */
export function jsonError(res: Response, message: ApiMessage, status = 400) {
  return res.status(status).json({ success: false, message, data: null } satisfies ApiResponse<null>);
}

/**
 * Base da API (white-label-stock-api), sem barra no fim. Lida a cada chamada para
 * os testes poderem apontar para uma API falsa.
 */
export function apiUrl() {
  return (process.env['API_URL'] || 'http://localhost:8005').replace(/\/+$/, '');
}
