import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { IUnit } from '../models/Unit';

export function getUnitsService() {
  return inject(AppClient).get<IUnit[]>('/api/units');
}
