import type { EStockRowKind } from '../enums/StockRowKind';

/**
 * Linha da tela de operação. `GROUP`: todos os itens atômicos de um produto (`quantity` = quantos há).
 * `RECORD`: um lote a granel (`item` = o lote).
 */
export interface IStockRow {
  key: string;
  kind: EStockRowKind;
  product: {
    id: number;
    name: string;
    sku: string | null;
    is_atomic: boolean;
    unit: { id: number; name: string; abbreviation: string };
  };
  item: { id: number; code: string } | null;
  quantity: string;
  reserved_quantity: string;
  items_count: number;
  /** Vencimento mais próximo (`YYYY-MM-DD`). */
  next_expires_at: string | null;
  expired_quantity: string;
  storages: Array<{ id: number; name: string }>;
}
