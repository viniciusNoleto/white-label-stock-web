import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { Client } from 'pg';

config({ path: '.env', quiet: true });

export const E2E_PREFIX = 'e2e-';

export const E2E_USER = { name: 'e2e-user', email: 'e2e-user@stockflow.local', password: 'e2e-password' };

async function withClient<T>(fn: (client: Client) => Promise<T>) {
  // Banco da API (white-label-stock-api), exposto no host — ver E2E_DB_* no .env.
  const client = new Client({
    host: process.env['E2E_DB_HOST'] ?? 'localhost',
    port: Number(process.env['E2E_DB_PORT'] ?? 5443),
    user: process.env['E2E_DB_USERNAME'],
    password: process.env['E2E_DB_PASSWORD'],
    database: process.env['E2E_DB_DATABASE'],
  });

  await client.connect();

  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/** Remove tudo que a suíte e2e criou (todos os registros usam o prefixo E2E_PREFIX). */
export async function cleanupE2EData() {
  const like = `${E2E_PREFIX}%`;

  await withClient(async (client) => {
    await client.query('BEGIN');

    try {
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
      await client.query('DELETE FROM users WHERE email LIKE $1', [like]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

// O Laravel (Hash::check) só aceita bcrypt com o prefixo `$2y$` do PHP — mesmo algoritmo do `$2b$` do bcryptjs.
function laravelBcrypt(password: string) {
  return bcrypt.hashSync(password, 10).replace(/^\$2[ab]\$/, '$2y$');
}

export async function createE2EUser() {
  await withClient((client) => client.query(
    'INSERT INTO users (name, email, password, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) ON CONFLICT (email) DO NOTHING',
    [E2E_USER.name, E2E_USER.email, laravelBcrypt(E2E_USER.password)],
  ));
}
