import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IInventoryItem } from '../models/InventoryItem';

/** Envie só um dos campos: valor absoluto (`quantity`) ou relativo (`quantity_add`/`quantity_subtract`). */
export type UpdateInventoryItemQuantityServicePayload =
  | { quantity: number }
  | { quantity_add: number }
  | { quantity_subtract: number };

export function updateInventoryItemQuantityService({ itemId, body }: PayloadBody<UpdateInventoryItemQuantityServicePayload> & { itemId: number }) {
  return inject(AppClient).patch<IInventoryItem>(`/api/inventory-items/${itemId}`, { body });
}
