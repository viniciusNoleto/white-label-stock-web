import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service } from '@angular/core';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/shared/constants/auth';
import { serializeAuthCookie } from '@/shared/utils/auth-cookie';
import type { IAuthSession } from '../models/AuthUser';

function readCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Tokens da sessão no browser, guardados em cookies comuns da origem do web
 * (`access_token` / `refresh_token`). Sempre lidos do `document.cookie` — a
 * renovação feita pelo servidor do web (page-session) e por outras abas já
 * aparece aqui. No SSR não há tokens: as páginas que usam a API são
 * renderizadas no browser.
 */
@Service()
export class AuthTokens {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  accessToken(): string | null {
    return this.read(ACCESS_TOKEN_COOKIE);
  }

  refreshToken(): string | null {
    return this.read(REFRESH_TOKEN_COOKIE);
  }

  hasSession(): boolean {
    return !!this.accessToken() || !!this.refreshToken();
  }

  set(session: Pick<IAuthSession, 'access_token' | 'refresh_token' | 'expires_in' | 'refresh_expires_in'>) {
    this.write(ACCESS_TOKEN_COOKIE, session.access_token, session.expires_in);
    this.write(REFRESH_TOKEN_COOKIE, session.refresh_token, session.refresh_expires_in);
  }

  clear() {
    this.write(ACCESS_TOKEN_COOKIE, '', 0);
    this.write(REFRESH_TOKEN_COOKIE, '', 0);
  }

  private read(name: string): string | null {
    if (!this.isBrowser) return null;

    return readCookie(this.document.cookie, name) || null;
  }

  private write(name: string, value: string, maxAge: number) {
    if (!this.isBrowser) return;

    const secure = this.document.location?.protocol === 'https:';

    this.document.cookie = serializeAuthCookie(name, value, { maxAge, secure });
  }
}
