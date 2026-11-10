import type { EStockMovementType } from '../enums/StockMovementType';

/**
 * Movimentação de um item do estoque (só leitura: a API grava em cada operação).
 * Código, nomes e unidade são copiados na hora; os ids viram `null` quando o registro some
 * (ex.: item atômico que saiu do estoque).
 * `quantity` com sinal (positivo entra, negativo sai, `"0.0000"` = transferência);
 * `balance` = quantidade do item logo depois.
 */
export interface IStockMovement {
  id: number;
  type: EStockMovementType;
  item_id: number | null;
  item_code: string;
  product_id: number | null;
  product_name: string;
  unit_abbreviation: string | null;
  quantity: string;
  balance: string;
  storage_id: number | null;
  storage_name: string | null;
  /** Só na transferência: de onde o item saiu. */
  previous_storage_name: string | null;
  delivery_package_id: number | null;
  user_id: number | null;
  user_name: string | null;
  created_at: string;
}

/** Sentido da movimentação pela quantidade: entrada, saída ou só mudança de lugar. */
export function movementDirection(movement: Pick<IStockMovement, 'quantity'>): 'in' | 'out' | 'none' {
  const quantity = +movement.quantity;

  if (quantity > 0) return 'in';
  if (quantity < 0) return 'out';
  return 'none';
}
