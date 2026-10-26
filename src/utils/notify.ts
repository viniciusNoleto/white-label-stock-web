import { inject } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { I18n } from '@/libs/i18n';
import type { ApiMessage } from '@/shared/types/api';
import { isApiError, resolveApiMessage } from './api-message';

/**
 * Substitui o `notifications.show` do Mantine nas logics:
 *
 * ```ts
 * const notify = injectNotify();
 * onSuccess: (res) => { notify.success(res); onSuccess(); },
 * onError: (err) => notify.error(err, 'notifications.errors.createUnit'),
 * ```
 *
 * - `success` usa sempre a mensagem i18n que veio da API (`res.message`).
 * - `error` usa a mensagem da API quando existe; senão, a chave de fallback.
 */
export function injectNotify() {
  const i18n = inject(I18n);

  return {
    success(response: { message: ApiMessage }) {
      toast.success(resolveApiMessage(response.message, i18n.language()));
    },
    error(error: unknown, fallbackKey: string) {
      toast.error(i18n.t('common.notifications.errorTitle'), {
        description: isApiError(error) ? resolveApiMessage(error.message, i18n.language()) : i18n.t(fallbackKey),
      });
    },
  };
}
