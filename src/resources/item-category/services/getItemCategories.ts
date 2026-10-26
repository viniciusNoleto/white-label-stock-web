import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { IItemCategory } from '../models/ItemCategory';

export function getItemCategoriesService() {
  return inject(AppClient).get<IItemCategory[]>('/api/item-categories');
}
