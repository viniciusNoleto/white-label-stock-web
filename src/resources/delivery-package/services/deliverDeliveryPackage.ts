import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { IDeliveryPackage } from '../models/DeliveryPackage';

/** Marca como entregue e subtrai os itens do estoque. */
export function deliverDeliveryPackageService({ packageId }: { packageId: number }) {
  return inject(AppClient).post<IDeliveryPackage>(`/api/delivery-packages/${packageId}/deliver`, { body: {} });
}
