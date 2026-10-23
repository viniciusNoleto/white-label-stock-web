import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { TEST_DB_NAME, connectionConfig } from './test-db-env';

export default async function setup() {
  const admin = new Client(connectionConfig('postgres'));
  await admin.connect();

  const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [TEST_DB_NAME]);
  if (!rowCount) await admin.query(`CREATE DATABASE "${TEST_DB_NAME}"`);

  await admin.end();

  const client = new Client(connectionConfig(TEST_DB_NAME));
  await client.connect();
  await migrate(drizzle(client), { migrationsFolder: './db/migrations' });
  await client.end();
}
