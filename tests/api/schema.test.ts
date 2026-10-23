import { describe, expect, it } from 'vitest';
import { getTableConfig } from 'drizzle-orm/pg-core';
import * as schema from '@/db/schema';

function foreignKeys(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).foreignKeys.map((fk) => {
    const ref = fk.reference();
    return `${ref.columns[0].name} -> ${getTableConfig(ref.foreignTable).name}.${ref.foreignColumns[0].name}`;
  });
}

describe('db schema', () => {
  it('exports every table', () => {
    expect(Object.keys(schema).sort()).toEqual([
      'inventoryItemHasCategory',
      'inventoryItemHasComponent',
      'inventoryItems',
      'itemCategories',
      'storages',
      'units',
    ]);
  });

  it('declares the expected foreign keys', () => {
    expect(foreignKeys(schema.inventoryItems)).toEqual(['unit_id -> units.id', 'storage_id -> storages.id']);
    expect(foreignKeys(schema.inventoryItemHasCategory)).toEqual([
      'inventory_item_id -> inventory_items.id',
      'item_category_id -> item_categories.id',
    ]);
    expect(foreignKeys(schema.inventoryItemHasComponent)).toEqual([
      'inventory_item_id -> inventory_items.id',
      'component_inventory_item_id -> inventory_items.id',
    ]);
  });

  it('keeps JS property names equal to snake_case column names', () => {
    for (const table of Object.values(schema)) {
      for (const [prop, column] of Object.entries(getTableConfig(table).columns.reduce((acc, c) => ({ ...acc, [c.name]: c }), {}))) {
        expect(prop).toMatch(/^[a-z_]+$/);
        expect((table as unknown as Record<string, { name: string }>)[prop].name).toBe((column as { name: string }).name);
      }
    }
  });
});
