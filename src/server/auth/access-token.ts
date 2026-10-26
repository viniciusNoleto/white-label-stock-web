import { eq } from 'drizzle-orm';
import { accessTokens, users } from '../../../db/schema';
import { db } from '../db';
import { ACCESS_TOKEN_TTL_SECONDS, generateOpaqueToken, hashToken } from './tokens';

export async function createAccessToken(userId: number) {
  const token = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000);

  await db.insert(accessTokens).values({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  });

  return { token, expiresAt };
}

export async function getUserFromAccessToken(token: string) {
  const [row] = await db
    .select({ user: users, expires_at: accessTokens.expires_at })
    .from(accessTokens)
    .innerJoin(users, eq(users.id, accessTokens.user_id))
    .where(eq(accessTokens.token_hash, hashToken(token)))
    .limit(1);

  if (!row || row.expires_at < new Date()) return null;

  return row.user;
}

export async function revokeAccessToken(token: string) {
  await db.delete(accessTokens).where(eq(accessTokens.token_hash, hashToken(token)));
}
