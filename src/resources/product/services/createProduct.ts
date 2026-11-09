import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IProduct } from '../models/Product';

export type CreateProductServicePayload = {
  name: string;
  sku: string | null;
  unit_id: number;
  is_atomic: boolean;
  shelf_life_days: number | null;
  category_ids: number[];
  components: Array<{ id: number; quantity_required: number }>;
};

export function createProductService({ body }: PayloadBody<CreateProductServicePayload>) {
  return inject(AppClient).post<IProduct>('/api/products', { body });
}
