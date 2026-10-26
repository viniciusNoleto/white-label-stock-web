import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../db/schema';

const pool = new Pool({
  host: process.env['POSTGRES_HOST'],
  port: Number(process.env['POSTGRES_PORT']),
  user: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
  database: process.env['POSTGRES_DB'],
});

export const db = drizzle(pool, { schema });

export type Db = typeof db;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
