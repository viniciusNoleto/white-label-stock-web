import { inject } from '@angular/core';
import { createMutation } from '@/utils/query';
import { logoutUserService } from '../services/logoutUser';
import { AuthStore } from '../stores/AuthStore';
import { AuthTokens } from '../stores/AuthTokens';

/**
 * Logout sem UI própria (o botão fica no header). Mesmo se a API falhar, a
 * sessão local é encerrada.
 */
export function injectLogoutLogicData({ onSuccess }: { onSuccess?: () => void } = {}) {
  const authStore = inject(AuthStore);
  const authTokens = inject(AuthTokens);

  function logout() {
    authStore.clear();

    onSuccess?.();
  }

  const logoutMutation = createMutation({
    mutationFn: () => logoutUserService({ body: { refresh_token: authTokens.refreshToken() ?? undefined } }),
    onSuccess: logout,
    onError: logout,
  });

  return { logoutMutation };
}
