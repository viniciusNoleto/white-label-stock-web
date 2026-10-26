import { inject, Injector, runInInjectionContext, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { catchError, map, type Observable, of, tap } from 'rxjs';
import { I18n } from '@/libs/i18n';
import { AppEvents } from '@/utils/app-client';
import type { IAuthUser } from '../models/AuthUser';
import { getUserService } from '../services/getUser';

/**
 * Fonte única do usuário logado no browser. `null` = visitante anônimo.
 *
 * Também é quem escuta `AppEvents.sessionExpired$` (refresh falhou): zera o
 * usuário e manda para o login.
 */
@Service()
export class AuthStore {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);

  private readonly _user = signal<IAuthUser | null>(null);
  private loaded = false;

  readonly user = this._user.asReadonly();

  constructor() {
    inject(AppEvents)
      .sessionExpired$.pipe(takeUntilDestroyed())
      .subscribe(() => this.handleSessionExpired());
  }

  /** Busca o usuário na primeira chamada; nas seguintes devolve o que já está em memória. */
  ensureUser(): Observable<IAuthUser | null> {
    if (this.loaded) return of(this._user());

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

  clear() {
    this.setUser(null);
  }

  private handleSessionExpired() {
    const hadUser = !!this._user();

    this.clear();

    if (hadUser) toast.error(this.i18n.t('auth.sessionExpired'));

    this.router.navigateByUrl('/auth/login');
  }
}
