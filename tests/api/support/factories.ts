import {
  inventoryItemHasCategory,
  inventoryItemHasComponent,
  inventoryItems,
  itemCategories,
  storages,
  units,
} from '../../../db/schema';
import { db } from '../../../src/server/db';

export const factories = {
  async unit(overrides: Partial<typeof units.$inferInsert> = {}) {
    const [row] = await db.insert(units).values({ name: 'Quilograma', abbreviation: 'kg', ...overrides }).returning();
    return row;
  },
  async category(overrides: Partial<typeof itemCategories.$inferInsert> = {}) {
    const [row] = await db.insert(itemCategories).values({ name: 'Matéria-prima', color_hex: '#123456', ...overrides }).returning();
    return row;
  },
  async storage(overrides: Partial<typeof storages.$inferInsert> = {}) {
    const [row] = await db.insert(storages).values({ name: 'Depósito A', description: null, ...overrides }).returning();
    return row;
  },
  async item(overrides: Partial<typeof inventoryItems.$inferInsert> & { unit_id: number }) {
    const [row] = await db.insert(inventoryItems).values({ name: 'Parafuso', quantity: '0', ...overrides }).returning();
    return row;
  },
  async linkCategory(inventory_item_id: number, item_category_id: number) {
    await db.insert(inventoryItemHasCategory).values({ inventory_item_id, item_category_id });
  },
  async linkComponent(inventory_item_id: number, component_inventory_item_id: number, quantity_required: string) {
    await db.insert(inventoryItemHasComponent).values({ inventory_item_id, component_inventory_item_id, quantity_required });
  },
};
