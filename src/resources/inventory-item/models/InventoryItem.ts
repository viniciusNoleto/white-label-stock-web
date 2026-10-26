export interface IInventoryItemUnit {
  id: number;
  name: string;
  abbreviation: string;
}

export interface IInventoryItemCategory {
  id: number;
  name: string;
  color_hex: string;
}

export interface IInventoryItemComponent {
  id: number;
  name: string;
  quantity_required: string;
  current_quantity: string;
}

export interface IInventoryItemStorage {
  id: number;
  name: string;
}

export interface IInventoryItem {
  id: number;
  name: string;
  quantity: string;
  created_at: string | null;
  updated_at: string | null;
  unit: IInventoryItemUnit;
  storage: IInventoryItemStorage | null;
  categories: IInventoryItemCategory[];
  components: IInventoryItemComponent[];
}

/** Máximo de unidades construíveis com o estoque atual dos componentes. */
export function maxBuildableQuantity(item: Pick<IInventoryItem, 'components'>): number {
  if (!item.components.length) return 0;

  return Math.floor(
    Math.min(...item.components.map((component) => Number(component.current_quantity) / Number(component.quantity_required))),
  );
}
