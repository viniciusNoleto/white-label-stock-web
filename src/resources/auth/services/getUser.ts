import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { IAuthUser } from '../models/AuthUser';

export type GetUserServiceResponse = {
  user: IAuthUser | null;
};

export function getUserService() {
  return inject(AppClient).get<GetUserServiceResponse>('/api/auth/me');
}
