import { vi } from 'vitest';
import { db } from '@/libs/db';
import { inventoryItems, inventoryItemHasCategory, inventoryItemHasComponent, itemCategories, storages, units } from '@/db/schema';

export const BASE_URL = 'http://localhost';

export function jsonRequest(path: string, method: string, body?: unknown) {
  return new Request(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function params<T extends Record<string, string>>(value: T) {
  return { params: Promise.resolve(value) };
}

export async function readJson(res: Response) {
  return { status: res.status, body: await res.json() };
}

/** Forces the next call of the given db method to throw, exercising the route's 500 branch. */
export function failNextDbCall(method: 'select' | 'insert' | 'update' | 'delete') {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(db, method).mockImplementationOnce(() => { throw new Error('db down'); });
}

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
