import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IDeliveryPackage } from '../models/DeliveryPackage';

export type CreateDeliveryPackageServicePayload = {
  notes: string | null;
  /** `item_ids`: só atômicos, itens escolhidos um a um (quantidade = quantos); sem ele, FEFO. */
  items: Array<{ product_id: number; quantity: number; item_ids?: number[] }>;
};

export function createDeliveryPackageService({ body }: PayloadBody<CreateDeliveryPackageServicePayload>) {
  return inject(AppClient).post<IDeliveryPackage>('/api/delivery-packages', { body });
}
