import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IItem } from '../models/Item';

/** Só lotes a granel. Envie um dos campos: valor absoluto (`quantity`) ou relativo (`quantity_add`/`quantity_subtract`). */
export type UpdateItemQuantityServicePayload =
  | { quantity: number }
  | { quantity_add: number }
  | { quantity_subtract: number };

export function updateItemQuantityService({ itemId, body }: PayloadBody<UpdateItemQuantityServicePayload> & { itemId: number }) {
  return inject(AppClient).patch<IItem>(`/api/items/${itemId}`, { body });
}
