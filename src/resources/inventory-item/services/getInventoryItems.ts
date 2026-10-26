import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { IInventoryItem } from '../models/InventoryItem';

export type GetInventoryItemsServiceQuery = {
  search?: string;
  page?: number;
  per_page?: number;
};

export function getInventoryItemsService({ query }: PayloadQuery<GetInventoryItemsServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IInventoryItem>>('/api/inventory-items', { query });
}
