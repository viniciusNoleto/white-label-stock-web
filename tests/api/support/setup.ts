import { afterAll, beforeEach, vi } from 'vitest';
import { TEST_DB_NAME } from './test-db-env';

process.env['POSTGRES_DB'] = TEST_DB_NAME;

const { db } = await import('../../../src/server/db');
const { sql } = await import('drizzle-orm');
const { startTestSession, stopTestServer } = await import('./http');

beforeEach(async () => {
  vi.restoreAllMocks();
  await db.execute(sql`
    TRUNCATE inventory_item_has_component, inventory_item_has_category, inventory_items, item_categories, units, storages,
      access_tokens, refresh_tokens, users
    RESTART IDENTITY CASCADE
  `);
  await startTestSession();
});

afterAll(async () => {
  await stopTestServer();
  await db.$client.end();
});
