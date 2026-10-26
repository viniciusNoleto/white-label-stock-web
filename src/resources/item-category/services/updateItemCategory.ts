import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IItemCategory } from '../models/ItemCategory';

export type UpdateItemCategoryServicePayload = {
  name: string;
  color_hex: string;
};

export function updateItemCategoryService({ itemCategoryId, body }: PayloadBody<UpdateItemCategoryServicePayload> & { itemCategoryId: number }) {
  return inject(AppClient).put<IItemCategory>(`/api/item-categories/${itemCategoryId}`, { body });
}
