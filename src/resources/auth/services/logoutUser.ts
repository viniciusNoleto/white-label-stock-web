import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';

export type LogoutUserServicePayload = {
  refresh_token?: string;
};

/** O access token vai no `Authorization: Bearer` (interceptor); o refresh token no corpo. */
export function logoutUserService({ body }: PayloadBody<LogoutUserServicePayload>) {
  return inject(AppClient).post<null>('/api/auth/logout', { body });
}
