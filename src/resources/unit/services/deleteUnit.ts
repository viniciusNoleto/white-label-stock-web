import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';

export function deleteUnitService({ unitId }: { unitId: number }) {
  return inject(AppClient).delete<null>(`/api/units/${unitId}`);
}
