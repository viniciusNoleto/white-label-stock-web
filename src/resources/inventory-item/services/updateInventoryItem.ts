import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IInventoryItem } from '../models/InventoryItem';

/** `category_ids` substitui todas as categorias do item (`[]` remove todas). */
export type UpdateInventoryItemServicePayload = {
  name: string;
  unit_id: number;
  category_ids: number[];
};

export function updateInventoryItemService({ itemId, body }: PayloadBody<UpdateInventoryItemServicePayload> & { itemId: number }) {
  return inject(AppClient).patch<IInventoryItem>(`/api/inventory-items/${itemId}`, { body });
}
