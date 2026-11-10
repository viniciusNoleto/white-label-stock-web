import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IItem } from '../models/Item';

/**
 * Atômico: `quantity` = quantos itens gerar (lote, cada um com código). A granel: quantidade do lote.
 * O código é sempre gerado pela API. `consume_components` tira a receita do estoque.
 */
export type CreateItemsServicePayload = {
  product_id: number;
  quantity: number;
  produced_at: string;
  storage_id: number | null;
  consume_components: boolean;
};

export function createItemsService({ body }: PayloadBody<CreateItemsServicePayload>) {
  return inject(AppClient).post<{ items: IItem[] }>('/api/items', { body });
}
