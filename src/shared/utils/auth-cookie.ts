/**
 * Cookie de sessão (`access_token` / `refresh_token`) no formato aceito tanto
 * por `document.cookie` (browser) quanto por `Set-Cookie` (servidor do web).
 * `maxAge` vem do `expires_in` / `refresh_expires_in` da API: o cookie some
 * junto com o token. `maxAge = 0` apaga.
 */
export function serializeAuthCookie(name: string, value: string, options: { maxAge: number; secure: boolean }) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${Math.max(0, Math.floor(options.maxAge))}`,
    'SameSite=Lax',
  ];

  if (options.secure) parts.push('Secure');

  return parts.join('; ');
}
