import { config } from 'dotenv';

config({ path: '.env', quiet: true });

export const TEST_DB_NAME = `${process.env['POSTGRES_DB']}_test`;

export function connectionConfig(database: string) {
  return {
    host: process.env['POSTGRES_HOST'],
    port: Number(process.env['POSTGRES_PORT']),
    user: process.env['POSTGRES_USER'],
    password: process.env['POSTGRES_PASSWORD'],
    database,
  };
}
