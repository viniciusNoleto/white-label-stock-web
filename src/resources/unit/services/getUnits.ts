import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { IUnit } from '../models/Unit';

export type GetUnitsServiceQuery = {
  page?: number;
  per_page?: number;
};

export function getUnitsService({ query }: PayloadQuery<GetUnitsServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IUnit>>('/api/units', { query });
}
