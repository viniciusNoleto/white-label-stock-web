import { getTableConfig, type PgTable } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import * as schema from '../../db/schema';

function foreignKeys(table: PgTable) {
  return getTableConfig(table).foreignKeys.map((fk) => {
    const ref = fk.reference();
    return `${ref.columns[0].name} -> ${getTableConfig(ref.foreignTable).name}.${ref.foreignColumns[0].name}`;
  });
}

describe('db schema', () => {
  it('exports every table', () => {
    expect(Object.keys(schema).sort()).toEqual([
      'accessTokens',
      'inventoryItemHasCategory',
      'inventoryItemHasComponent',
      'inventoryItems',
      'itemCategories',
      'refreshTokens',
      'storages',
      'units',
      'users',
    ]);
  });

  it('declares the expected foreign keys', () => {
    expect(foreignKeys(schema.inventoryItems)).toEqual(['unit_id -> units.id', 'storage_id -> storages.id']);
    expect(foreignKeys(schema.accessTokens)).toEqual(['user_id -> users.id']);
    expect(foreignKeys(schema.refreshTokens)).toEqual(['user_id -> users.id']);
  });

  it('keeps JS property names equal to snake_case column names (no camelCase leaking into JSON)', () => {
    for (const table of Object.values(schema) as PgTable[]) {
      for (const column of getTableConfig(table).columns) {
        expect(column.name).toMatch(/^[a-z_]+$/);
        expect((table as unknown as Record<string, { name: string }>)[column.name]?.name).toBe(column.name);
      }
    }
  });
});
