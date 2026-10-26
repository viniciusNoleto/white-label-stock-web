export function parseCookieHeader(header: string | undefined | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key) cookies[key] = decodeURIComponent(rest.join('='));
  }

  return cookies;
}

export function serializeCookieHeader(cookies: Record<string, string>) {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('; ');
}

/** `nome → valor` de cada `Set-Cookie` (valor vazio quando o cookie está sendo apagado). */
export function parseSetCookies(setCookies: string[]): Record<string, string> {
  const cookies: Record<string, string> = {};

  for (const cookie of setCookies) {
    const [pair] = cookie.split(';');
    const [key, ...rest] = pair.trim().split('=');
    if (key) cookies[key] = decodeURIComponent(rest.join('='));
  }

  return cookies;
}
