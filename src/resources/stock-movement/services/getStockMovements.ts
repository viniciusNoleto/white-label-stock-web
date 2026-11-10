import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { EStockMovementType } from '../enums/StockMovementType';
import type { IStockMovement } from '../models/StockMovement';

/**
 * Mais recentes primeiro. `search` busca no código do item ou no nome do produto;
 * `date_from`/`date_to` (`YYYY-MM-DD`) são inclusivos.
 */
export type GetStockMovementsServiceQuery = {
  search?: string;
  type?: EStockMovementType;
  product_id?: number;
  storage_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export function getStockMovementsService({ query }: PayloadQuery<GetStockMovementsServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IStockMovement>>('/api/stock-movements', { query });
}
