import { boolean, integer, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token_hash: text('token_hash').notNull().unique(),
  // todos os tokens nascidos da mesma sessão original compartilham family_id;
  // reuso de um token já rotacionado revoga a família inteira (sinal de roubo)
  family_id: uuid('family_id').notNull(),
  revoked: boolean('revoked').notNull().default(false),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
