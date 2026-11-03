import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';

export function deleteDeliveryPackageService({ packageId }: { packageId: number }) {
  return inject(AppClient).delete<null>(`/api/delivery-packages/${packageId}`);
}
