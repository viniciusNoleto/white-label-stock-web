import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IAuthSession } from '../models/AuthUser';

export type LoginUserServicePayload = {
  email: string;
  password: string;
};

export type LoginUserServiceResponse = IAuthSession;

export function loginUserService({ body }: PayloadBody<LoginUserServicePayload>) {
  return inject(AppClient).post<LoginUserServiceResponse>('/api/auth/login', { body });
}
