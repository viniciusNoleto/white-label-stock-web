import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';

export function logoutUserService() {
  return inject(AppClient).post<null>('/api/auth/logout');
}
