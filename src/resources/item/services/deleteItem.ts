import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';

export function deleteItemService({ itemId }: { itemId: number }) {
  return inject(AppClient).delete<null>(`/api/items/${itemId}`);
}
