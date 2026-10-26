import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IInventoryItem } from '../models/InventoryItem';

export type UpdateInventoryItemNameServicePayload = {
  name: string;
};

export function updateInventoryItemNameService({ itemId, body }: PayloadBody<UpdateInventoryItemNameServicePayload> & { itemId: number }) {
  return inject(AppClient).patch<IInventoryItem>(`/api/inventory-items/${itemId}`, { body });
}
