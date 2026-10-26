import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const accessTokens = pgTable('access_tokens', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // token opaco (não JWT) — só o hash sha256 é persistido, o valor cru vai só no cookie httpOnly
  token_hash: text('token_hash').notNull().unique(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
