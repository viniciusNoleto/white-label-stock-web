import express, { type ErrorRequestHandler, type Request, Router } from 'express';
import { MESSAGES, apiUrl, jsonError } from './utils/api';

// Repassados para a API: sessão (`Authorization: Bearer`), idioma e formato do corpo.
// Os cookies do web (tokens, idioma) ficam aqui: a API não usa cookies.
const FORWARDED_REQUEST_HEADERS = ['accept', 'accept-language', 'authorization', 'content-type', 'user-agent'];

// Recalculados pelo Express (o fetch já descomprime o corpo). A API não grava cookies na origem do web.
const SKIPPED_RESPONSE_HEADERS = new Set(['connection', 'content-encoding', 'content-length', 'keep-alive', 'set-cookie', 'transfer-encoding']);

const REQUEST_TIMEOUT_MS = 60_000;

function requestHeaders(req: Request) {
  const headers = new Headers();

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = req.headers[name];
    if (typeof value === 'string') headers.set(name, value);
  }

  headers.set('x-forwarded-for', req.ip ?? '');
  headers.set('x-forwarded-proto', req.protocol);
  headers.set('x-forwarded-host', req.get('host') ?? '');

  return headers;
}

// Corpo grande demais (413) ou ilegível: responde no envelope da API sem chegar a ela.
const handleProxyErrors: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error);

  const status = typeof error?.status === 'number' && error.status >= 400 && error.status < 500 ? error.status : 502;

  if (status === 502) console.error(error);

  return jsonError(res, status === 502 ? MESSAGES.apiUnavailable : MESSAGES.invalidPayload, status);
};

/**
 * `/api/**` → white-label-stock-api (Laravel), mesmo caminho. O browser continua falando só
 * com a origem do web (sem CORS); o access token vai no header `Authorization` e passa direto.
 */
export function createApiProxy() {
  const router = Router();

  router.use(express.raw({ type: () => true, limit: '1mb' }));

  router.use(async (req, res) => {
    let response: globalThis.Response;

    try {
      response = await fetch(`${apiUrl()}/api${req.url}`, {
        method: req.method,
        headers: requestHeaders(req),
        body: Buffer.isBuffer(req.body) && req.body.length ? new Uint8Array(req.body) : undefined,
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      console.error(error);
      return jsonError(res, MESSAGES.apiUnavailable, 502);
    }

    res.status(response.status);

    response.headers.forEach((value, name) => {
      if (!SKIPPED_RESPONSE_HEADERS.has(name)) res.setHeader(name, value);
    });

    return res.send(Buffer.from(await response.arrayBuffer()));
  });

  router.use(handleProxyErrors);

  return router;
}
