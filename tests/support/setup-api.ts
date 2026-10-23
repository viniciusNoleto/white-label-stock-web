import { afterAll, beforeEach, vi } from 'vitest';
import { TEST_DB_NAME } from './test-db-env';

process.env.POSTGRES_DB = TEST_DB_NAME;

const { db } = await import('@/libs/db');
const { sql } = await import('drizzle-orm');

beforeEach(async () => {
  vi.restoreAllMocks();
  await db.execute(sql`
    TRUNCATE inventory_item_has_component, inventory_item_has_category, inventory_items, item_categories, units, storages
    RESTART IDENTITY CASCADE
  `);
});

afterAll(async () => {
  await db.$client.end();
});
