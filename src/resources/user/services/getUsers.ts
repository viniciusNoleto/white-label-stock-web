import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { IUser } from '../models/User';

export type GetUsersServiceQuery = {
  search?: string;
  page?: number;
  per_page?: number;
};

export function getUsersService({ query }: PayloadQuery<GetUsersServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IUser>>('/api/users', { query });
}
