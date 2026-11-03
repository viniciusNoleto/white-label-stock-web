import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IDeliveryPackage } from '../models/DeliveryPackage';

export type CreateDeliveryPackageServicePayload = {
  notes: string | null;
  items: Array<{ id: number; quantity: number }>;
};

export function createDeliveryPackageService({ body }: PayloadBody<CreateDeliveryPackageServicePayload>) {
  return inject(AppClient).post<IDeliveryPackage>('/api/delivery-packages', { body });
}
