import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { IItemCategory } from '../models/ItemCategory';

export type GetItemCategoriesServiceQuery = {
  page?: number;
  per_page?: number;
};

export function getItemCategoriesService({ query }: PayloadQuery<GetItemCategoriesServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IItemCategory>>('/api/item-categories', { query });
}
