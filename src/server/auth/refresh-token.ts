import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { refreshTokens } from '../../../db/schema';
import { db } from '../db';
import { REFRESH_TOKEN_TTL_SECONDS, generateOpaqueToken, hashToken } from './tokens';

export async function createRefreshToken(userId: number, familyId?: string) {
  const token = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  const [row] = await db.insert(refreshTokens).values({
    user_id: userId,
    token_hash: hashToken(token),
    family_id: familyId ?? randomUUID(),
    expires_at: expiresAt,
  }).returning();

  return { token, expiresAt, familyId: row.family_id, userId };
}

export async function rotateRefreshToken(token: string) {
  const [existing] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token_hash, hashToken(token)))
    .limit(1);

  if (!existing || existing.expires_at < new Date()) return null;

  // Reuso de um token já rotacionado: alguém ficou com uma cópia antiga.
  // Revoga a família inteira, derrubando todas as sessões que dependem dela.
  if (existing.revoked) {
    await db.update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.family_id, existing.family_id));
    return null;
  }

  await db.update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.id, existing.id));

  return createRefreshToken(existing.user_id, existing.family_id);
}

export async function deleteRefreshToken(token: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.token_hash, hashToken(token)));
}
