import type { EDeliveryPackageStatus } from '../enums/DeliveryPackageStatus';

export interface IDeliveryPackageItemUnit {
  id: number;
  name: string;
  abbreviation: string;
}

/** Item do estoque reservado para o pacote (`item_id` vira `null` quando o item atômico já foi entregue). */
export interface IDeliveryPackageAllocation {
  item_id: number | null;
  code: string;
  quantity: string;
}

/**
 * Produto dentro do pacote: `quantity` = quantidade no pacote; `stock_quantity` = estoque atual do produto;
 * `allocations` = quais itens pegar (códigos), escolhidos por FEFO.
 */
export interface IDeliveryPackageItem {
  product_id: number;
  name: string;
  is_atomic: boolean;
  quantity: string;
  stock_quantity: string;
  unit: IDeliveryPackageItemUnit;
  allocations: IDeliveryPackageAllocation[];
}

export interface IDeliveryPackage {
  id: number;
  status: EDeliveryPackageStatus;
  notes: string | null;
  delivered_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  items: IDeliveryPackageItem[];
}
