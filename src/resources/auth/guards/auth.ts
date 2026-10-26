import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStore } from '../stores/AuthStore';

/** Rotas que exigem sessão — sem usuário, vai para o login. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  return inject(AuthStore)
    .ensureUser()
    .pipe(map((user) => (user ? true : router.createUrlTree(['/auth/login']))));
};
