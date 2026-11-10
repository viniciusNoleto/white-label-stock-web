import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { IStorage } from '../models/Storage';

export type GetStoragesServiceQuery = {
  page?: number;
  per_page?: number;
};

export function getStoragesService({ query }: PayloadQuery<GetStoragesServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IStorage>>('/api/storages', { query });
}
