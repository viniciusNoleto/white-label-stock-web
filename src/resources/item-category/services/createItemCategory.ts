import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IItemCategory } from '../models/ItemCategory';

export type CreateItemCategoryServicePayload = {
  name: string;
  color_hex: string;
};

export function createItemCategoryService({ body }: PayloadBody<CreateItemCategoryServicePayload>) {
  return inject(AppClient).post<IItemCategory>('/api/item-categories', { body });
}
