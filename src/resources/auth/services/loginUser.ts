import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IAuthUser } from '../models/AuthUser';

export type LoginUserServicePayload = {
  email: string;
  password: string;
};

export type LoginUserServiceResponse = {
  user: IAuthUser;
};

export function loginUserService({ body }: PayloadBody<LoginUserServicePayload>) {
  return inject(AppClient).post<LoginUserServiceResponse>('/api/auth/login', { body });
}
