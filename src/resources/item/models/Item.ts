import { daysBetweenISO } from '@/utils/date';
import { EExpirationStatus } from '../enums/ExpirationStatus';

/** Mesma janela do filtro "vencendo" da API (`Item::EXPIRING_DAYS`). */
export const EXPIRING_DAYS = 7;

export interface IItemProduct {
  id: number;
  name: string;
  sku: string | null;
  is_atomic: boolean;
  unit: { id: number; name: string; abbreviation: string };
}

export interface IItemStorage {
  id: number;
  name: string;
}

/**
 * Item: registro físico de um produto, com código próprio. Atômico → `quantity` sempre 1;
 * a granel → a quantidade do lote. Datas em `YYYY-MM-DD`.
 */
export interface IItem {
  id: number;
  code: string;
  quantity: string;
  /** Separado em pacotes de entrega pendentes. */
  reserved_quantity: string;
  produced_at: string;
  expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  product: IItemProduct;
  storage: IItemStorage | null;
}

/** Vencido (antes de hoje), vencendo (hoje até `EXPIRING_DAYS`), válido, ou sem validade. */
export function expirationStatus(expiresAt: string | null, today: string): EExpirationStatus {
  if (!expiresAt) return EExpirationStatus.NONE;

  const days = daysBetweenISO(today, expiresAt);

  if (days < 0) return EExpirationStatus.EXPIRED;
  if (days <= EXPIRING_DAYS) return EExpirationStatus.EXPIRING;

  return EExpirationStatus.VALID;
}
