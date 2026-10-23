import type { IUnit } from '@/resources/unit/models/Unit';
import type { IItemCategory } from '@/resources/item-category/models/ItemCategory';
import type { IStorage } from '@/resources/storage/models/Storage';
import type { IInventoryItem } from '@/resources/inventory-item/models/InventoryItem';

export const unitKg: IUnit = { id: '1', name: 'Quilograma', abbreviation: 'kg', created_at: null, updated_at: null };
export const unitUn: IUnit = { id: '2', name: 'Unidade', abbreviation: 'un', created_at: null, updated_at: null };

export const categoryRaw: IItemCategory = { id: '1', name: 'Matéria-prima', color_hex: '#123456', created_at: null, updated_at: null };

export const storageA: IStorage = { id: 1, name: 'Depósito A', description: 'Térreo', created_at: null, updated_at: null };
export const storageB: IStorage = { id: 2, name: 'Depósito B', description: null, created_at: null, updated_at: null };

export const itemWood: IInventoryItem = {
  id: '10',
  name: 'Madeira',
  quantity: '10.0000',
  created_at: null,
  updated_at: null,
  unit: { id: '1', name: 'Quilograma', abbreviation: 'kg' },
  storage: { id: 1, name: 'Depósito A' },
  categories: [{ id: '1', name: 'Matéria-prima', color_hex: '#123456' }],
  components: [],
};

export const itemChair: IInventoryItem = {
  id: '11',
  name: 'Cadeira',
  quantity: '1.0000',
  created_at: null,
  updated_at: null,
  unit: { id: '2', name: 'Unidade', abbreviation: 'un' },
  storage: null,
  categories: [],
  components: [{ id: '10', name: 'Madeira', quantity_required: '3.0000', current_quantity: '10.0000' }],
};
