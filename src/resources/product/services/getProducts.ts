import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { IProduct } from '../models/Product';

export type GetProductsServiceQuery = {
  search?: string;
  page?: number;
  per_page?: number;
};

export function getProductsService({ query }: PayloadQuery<GetProductsServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IProduct>>('/api/products', { query });
}
