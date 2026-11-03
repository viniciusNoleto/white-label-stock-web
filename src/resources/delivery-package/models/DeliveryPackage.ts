import type { EDeliveryPackageStatus } from '../enums/DeliveryPackageStatus';

export interface IDeliveryPackageItemUnit {
  id: number;
  name: string;
  abbreviation: string;
}

/** Item dentro do pacote: `quantity` = quantidade no pacote; `current_quantity` = estoque atual do item. */
export interface IDeliveryPackageItem {
  id: number;
  name: string;
  quantity: string;
  current_quantity: string;
  unit: IDeliveryPackageItemUnit;
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

/**
 * Quanto do item ainda pode entrar num pacote: estoque − já empacotado em pacotes pendentes,
 * devolvendo o que o próprio pacote em edição já separou (`ownQuantity`). Nunca negativo.
 */
export function freeQuantity(item: { quantity: string; packaged_quantity: string }, ownQuantity = 0): number {
  return Math.max(0, Number(item.quantity) - Number(item.packaged_quantity) + ownQuantity);
}
