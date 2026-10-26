import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IInventoryItem } from '../models/InventoryItem';

export type UpdateInventoryItemStorageServicePayload = {
  storage_id: number | null;
};

export function updateInventoryItemStorageService({ itemId, body }: PayloadBody<UpdateInventoryItemStorageServicePayload> & { itemId: number }) {
  return inject(AppClient).patch<IInventoryItem>(`/api/inventory-items/${itemId}`, { body });
}
