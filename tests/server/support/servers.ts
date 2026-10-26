import express, { type Express } from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

export type RunningServer = { url: string; close: () => Promise<void> };

export async function listen(app: Express): Promise<RunningServer> {
  const server = await new Promise<Server>((resolve) => {
    const started = app.listen(0, () => resolve(started));
  });

  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

export type ReceivedRequest = { method: string; url: string; headers: Record<string, string | string[] | undefined>; body: string };

/**
 * API falsa: registra cada requisição e responde com o handler de cada teste.
 */
export function fakeApi() {
  const received: ReceivedRequest[] = [];
  let handler: (req: express.Request, res: express.Response) => void = (_req, res) => {
    res.json({ success: true, data: null });
  };

  const app = express();

  app.use(express.text({ type: () => true }));

  app.use((req, res) => {
    received.push({ method: req.method, url: req.url, headers: req.headers, body: typeof req.body === 'string' ? req.body : '' });
    handler(req, res);
  });

  return {
    app,
    received,
    respond(next: typeof handler) {
      handler = next;
    },
  };
}
