import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { IRegistrationRequest } from '../models/RegistrationRequest';

export type GetRegistrationRequestsServiceQuery = {
  search?: string;
  page?: number;
  per_page?: number;
};

export function getRegistrationRequestsService({ query }: PayloadQuery<GetRegistrationRequestsServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IRegistrationRequest>>('/api/registration-requests', { query });
}
