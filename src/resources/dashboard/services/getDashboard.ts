import { inject } from '@angular/core';
import type { PayloadQuery } from '@/shared/types/api';
import { AppClient } from '@/utils/app-client';
import type { DashboardPeriod, IDashboard } from '../models/Dashboard';

export type GetDashboardServiceQuery = {
  period?: DashboardPeriod;
};

/** A API serve o painel do cache e só recalcula quando algo mudou: pode ser chamado sempre que precisar. */
export function getDashboardService({ query }: PayloadQuery<GetDashboardServiceQuery> = {}) {
  return inject(AppClient).get<IDashboard>('/api/dashboard', { query });
}
