import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IDeliveryPackage } from '../models/DeliveryPackage';

/** Substitui anotações e itens (só pacotes pendentes). */
export type UpdateDeliveryPackageServicePayload = {
  notes: string | null;
  /** `item_ids`: só atômicos, itens escolhidos um a um (quantidade = quantos); sem ele, FEFO. */
  items: Array<{ product_id: number; quantity: number; item_ids?: number[] }>;
};

export function updateDeliveryPackageService({ packageId, body }: PayloadBody<UpdateDeliveryPackageServicePayload> & { packageId: number }) {
  return inject(AppClient).put<IDeliveryPackage>(`/api/delivery-packages/${packageId}`, { body });
}
