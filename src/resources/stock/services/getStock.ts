import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { IStockRow } from '../models/StockRow';

/** `search` busca no nome ou SKU do produto; os filtros valem antes do agrupamento por produto. */
export type GetStockServiceQuery = {
  search?: string;
  storage_id?: number;
  expires_at?: string;
  page?: number;
  per_page?: number;
};

export function getStockService({ query }: PayloadQuery<GetStockServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IStockRow>>('/api/stock', { query });
}
