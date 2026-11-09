import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IProduct } from '../models/Product';
import type { CreateProductServicePayload } from './createProduct';

/** Substitui tudo: categorias e receita incluídas (`[]` remove todas). */
export type UpdateProductServicePayload = CreateProductServicePayload;

export function updateProductService({ productId, body }: PayloadBody<UpdateProductServicePayload> & { productId: number }) {
  return inject(AppClient).put<IProduct>(`/api/products/${productId}`, { body });
}
