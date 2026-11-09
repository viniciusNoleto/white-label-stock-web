import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { IStockRow } from '../models/StockRow';

export type GetStockServiceQuery = {
  search?: string;
  page?: number;
  per_page?: number;
};

export function getStockService({ query }: PayloadQuery<GetStockServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IStockRow>>('/api/stock', { query });
}
