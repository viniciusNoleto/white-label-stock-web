import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IInventoryItem } from '../models/InventoryItem';

export type BuildInventoryItemServicePayload = {
  quantity: number;
};

export function buildInventoryItemService({ itemId, body }: PayloadBody<BuildInventoryItemServicePayload> & { itemId: number }) {
  return inject(AppClient).post<IInventoryItem>(`/api/inventory-items/${itemId}/build`, { body });
}
