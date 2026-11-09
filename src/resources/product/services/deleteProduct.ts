import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';

export function deleteProductService({ productId }: { productId: number }) {
  return inject(AppClient).delete<null>(`/api/products/${productId}`);
}
