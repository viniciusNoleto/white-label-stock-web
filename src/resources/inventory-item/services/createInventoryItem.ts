import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IInventoryItem } from '../models/InventoryItem';

export type CreateInventoryItemServicePayload = {
  name: string;
  unit_id: number;
  storage_id?: number | null;
  quantity?: number;
  category_ids?: number[];
  components?: Array<{ id: number; quantity_required: number }>;
};

export function createInventoryItemService({ body }: PayloadBody<CreateInventoryItemServicePayload>) {
  return inject(AppClient).post<IInventoryItem>('/api/inventory-items', { body });
}
