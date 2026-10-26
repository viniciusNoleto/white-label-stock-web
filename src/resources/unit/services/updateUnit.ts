import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IUnit } from '../models/Unit';

export type UpdateUnitServicePayload = {
  name: string;
  abbreviation: string;
};

export function updateUnitService({ unitId, body }: PayloadBody<UpdateUnitServicePayload> & { unitId: number }) {
  return inject(AppClient).put<IUnit>(`/api/units/${unitId}`, { body });
}
