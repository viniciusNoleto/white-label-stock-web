import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IUnit } from '../models/Unit';

export type CreateUnitServicePayload = {
  name: string;
  abbreviation: string;
};

export function createUnitService({ body }: PayloadBody<CreateUnitServicePayload>) {
  return inject(AppClient).post<IUnit>('/api/units', { body });
}
