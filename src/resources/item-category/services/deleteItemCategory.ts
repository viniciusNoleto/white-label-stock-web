import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';

export function deleteItemCategoryService({ itemCategoryId }: { itemCategoryId: number }) {
  return inject(AppClient).delete<null>(`/api/item-categories/${itemCategoryId}`);
}
