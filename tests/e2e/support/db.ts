import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { Client } from 'pg';

config({ path: '.env', quiet: true });

export const E2E_PREFIX = 'e2e-';

/** Usuário da sessão salva (storageState): admin, para alcançar também as telas de administração. */
export const E2E_USER = { name: 'e2e-user', email: 'e2e-user@stockflow.local', password: 'e2e-password' };

/** Usuário comum, para conferir que as telas de administração ficam fechadas para ele. */
export const E2E_REGULAR_USER = { name: 'e2e-regular', email: 'e2e-regular@stockflow.local', password: 'e2e-password' };

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
      const e2eProducts = 'SELECT id FROM products WHERE name LIKE $1';

      // Pacotes com produtos e2e (as linhas do pacote saem em cascata).
      await client.query(`
        DELETE FROM delivery_packages
        WHERE id IN (SELECT delivery_package_id FROM delivery_package_has_item WHERE product_id IN (${e2eProducts}))`, [like]);
      await client.query(`DELETE FROM items WHERE product_id IN (${e2eProducts})`, [like]);
      await client.query(`
        DELETE FROM product_has_component
        WHERE product_id IN (${e2eProducts}) OR component_product_id IN (${e2eProducts})`, [like]);
      await client.query(`
        DELETE FROM product_has_category
        WHERE product_id IN (${e2eProducts})
           OR item_category_id IN (SELECT id FROM item_categories WHERE name LIKE $1)`, [like]);
      await client.query('DELETE FROM products WHERE name LIKE $1', [like]);
      await client.query('DELETE FROM item_categories WHERE name LIKE $1', [like]);
      await client.query('DELETE FROM units WHERE name LIKE $1', [like]);
      await client.query('DELETE FROM storages WHERE name LIKE $1', [like]);
      await client.query('DELETE FROM registration_requests WHERE email LIKE $1', [like]);
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
  await insertUser(E2E_USER, true);
  await insertUser(E2E_REGULAR_USER, false);
}

export async function insertUser(user: { name: string; email: string; password: string }, isAdmin = false) {
  await withClient((client) => client.query(
    `INSERT INTO users (name, email, password, is_admin, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET is_admin = EXCLUDED.is_admin`,
    [user.name, user.email, laravelBcrypt(user.password), isAdmin],
  ));
}
