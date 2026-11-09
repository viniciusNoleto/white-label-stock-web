import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IDeliveryPackage } from '../models/DeliveryPackage';

/** Substitui anotações e itens (só pacotes pendentes). */
export type UpdateDeliveryPackageServicePayload = {
  notes: string | null;
  items: Array<{ product_id: number; quantity: number }>;
};

export function updateDeliveryPackageService({ packageId, body }: PayloadBody<UpdateDeliveryPackageServicePayload> & { packageId: number }) {
  return inject(AppClient).put<IDeliveryPackage>(`/api/delivery-packages/${packageId}`, { body });
}
