import express, { type ErrorRequestHandler, Router } from 'express';
import { requireUser } from '../auth/middleware';
import { MESSAGES, jsonError } from '../utils/api';
import { authRouter } from './auth';
import { inventoryItemsRouter } from './inventory-items';
import { itemCategoriesRouter } from './item-categories';
import { storagesRouter } from './storages';
import { unitsRouter } from './units';

// JSON malformado ou corpo grande demais chegam aqui antes de qualquer rota.
const handleApiErrors: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error);

  const status = typeof error?.status === 'number' && error.status >= 400 && error.status < 500 ? error.status : 500;

  if (status === 500) console.error(error);

  return jsonError(res, status === 500 ? MESSAGES.serverError : MESSAGES.invalidPayload, status);
};

export function createApiRouter() {
  const router = Router();

  router.use(express.json({ limit: '1mb' }));

  router.use('/auth', authRouter);

  router.use(requireUser);

  router.use('/units', unitsRouter);
  router.use('/item-categories', itemCategoriesRouter);
  router.use('/storages', storagesRouter);
  router.use('/inventory-items', inventoryItemsRouter);

  router.use((_req, res) => jsonError(res, MESSAGES.notFound, 404));

  router.use(handleApiErrors);

  return router;
}
