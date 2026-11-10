import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { IItem } from '../models/Item';

/** `search` busca só no código do item; `expires_at` (`YYYY-MM-DD`) = vencimento exato. */
export type GetItemsServiceQuery = {
  search?: string;
  product_id?: number;
  storage_id?: number;
  expiration?: 'expired' | 'expiring' | 'valid';
  expires_at?: string;
  page?: number;
  per_page?: number;
};

export function getItemsService({ query }: PayloadQuery<GetItemsServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IItem>>('/api/items', { query });
}
