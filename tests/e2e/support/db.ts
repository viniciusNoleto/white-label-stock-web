import { Client } from 'pg';
import { config } from 'dotenv';

config({ path: '.env', quiet: true });

export const E2E_PREFIX = 'e2e-';

/** Removes every row created by the e2e suite (all of them are named with E2E_PREFIX). */
export async function cleanupE2EData() {
  const client = new Client({
    host: process.env.E2E_POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });
  const like = `${E2E_PREFIX}%`;

  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      DELETE FROM inventory_item_has_component
      WHERE inventory_item_id IN (SELECT id FROM inventory_items WHERE name LIKE $1)
         OR component_inventory_item_id IN (SELECT id FROM inventory_items WHERE name LIKE $1)`, [like]);
    await client.query(`
      DELETE FROM inventory_item_has_category
      WHERE inventory_item_id IN (SELECT id FROM inventory_items WHERE name LIKE $1)
         OR item_category_id IN (SELECT id FROM item_categories WHERE name LIKE $1)`, [like]);
    await client.query('DELETE FROM inventory_items WHERE name LIKE $1', [like]);
    await client.query('DELETE FROM item_categories WHERE name LIKE $1', [like]);
    await client.query('DELETE FROM units WHERE name LIKE $1', [like]);
    await client.query('DELETE FROM storages WHERE name LIKE $1', [like]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.end();
  }
}
