import { inject } from '@angular/core';
import { createMutation } from '@/utils/query';
import { logoutUserService } from '../services/logoutUser';
import { AuthStore } from '../stores/AuthStore';

/**
 * Logout sem UI própria (o botão fica no header). Mesmo se a API falhar, a
 * sessão local é encerrada.
 */
export function injectLogoutLogicData({ onSuccess }: { onSuccess?: () => void } = {}) {
  const authStore = inject(AuthStore);

  function logout() {
    authStore.clear();

    onSuccess?.();
  }

  const logoutMutation = createMutation({
    mutationFn: () => logoutUserService(),
    onSuccess: logout,
    onError: logout,
  });

  return { logoutMutation };
}
