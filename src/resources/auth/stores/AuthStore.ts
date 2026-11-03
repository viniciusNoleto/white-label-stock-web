import { inject, Injector, runInInjectionContext, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { catchError, map, type Observable, of, tap } from 'rxjs';
import { I18n } from '@/libs/i18n';
import { AppEvents } from '@/utils/app-client';
import type { IAuthSession, IAuthUser } from '../models/AuthUser';
import { getUserService } from '../services/getUser';
import { AuthTokens } from './AuthTokens';

/**
 * Fonte única do usuário logado no browser. `null` = visitante anônimo.
 * Os tokens ficam em `AuthTokens`; `setSession`/`clear` cuidam dos dois.
 *
 * Também é quem escuta `AppEvents.sessionExpired$` (refresh falhou): encerra a
 * sessão local e manda para o login.
 */
@Service()
export class AuthStore {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);
  private readonly tokens = inject(AuthTokens);

  private readonly _user = signal<IAuthUser | null>(null);
  private loaded = false;

  readonly user = this._user.asReadonly();

  constructor() {
    inject(AppEvents)
      .sessionExpired$.pipe(takeUntilDestroyed())
      .subscribe(() => this.handleSessionExpired());
  }

  /**
   * Busca o usuário na primeira chamada; nas seguintes devolve o que já está em memória.
   * Sem nenhum token é visitante anônimo — nem chama a API.
   */
  ensureUser(): Observable<IAuthUser | null> {
    if (this.loaded) return of(this._user());

    if (!this.tokens.hasSession()) {
      this.setUser(null);

      return of(null);
    }

    return runInInjectionContext(this.injector, () => getUserService()).pipe(
      map((response) => response.data.user),
      catchError(() => of(null)),
      tap((user) => this.setUser(user)),
    );
  }

  setUser(user: IAuthUser | null) {
    this._user.set(user);
    this.loaded = true;
  }

  /** Login/refresh: grava os tokens e o usuário. */
  setSession(session: IAuthSession) {
    this.tokens.set(session);
    this.setUser(session.user);
  }

  /** Encerra a sessão local: apaga os tokens e zera o usuário. */
  clear() {
    this.tokens.clear();
    this.setUser(null);
  }

  private handleSessionExpired() {
    const hadUser = !!this._user();

    this.clear();

    if (hadUser) toast.error(this.i18n.t('auth.sessionExpired'));

    this.router.navigateByUrl('/auth/login');
  }
}
