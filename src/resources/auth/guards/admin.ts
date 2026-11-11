import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStore } from '../stores/AuthStore';

/** Telas de administração (usuários e pedidos de cadastro) — usuário comum volta para o painel. */
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  return inject(AuthStore)
    .ensureUser()
    .pipe(map((user) => (user?.is_admin ? true : router.createUrlTree(['/dashboard']))));
};
