import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IItem } from '../models/Item';

/** Atualização parcial; `expires_at: null` remove o vencimento e `storage_id: null` desvincula. */
export type UpdateItemServicePayload = {
  code?: string;
  produced_at?: string;
  expires_at?: string | null;
  storage_id?: number | null;
};

export function updateItemService({ itemId, body }: PayloadBody<UpdateItemServicePayload> & { itemId: number }) {
  return inject(AppClient).patch<IItem>(`/api/items/${itemId}`, { body });
}
