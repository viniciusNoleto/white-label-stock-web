import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';

export type RegisterUserServicePayload = {
  name: string;
  email: string;
  password: string;
};

/** Cadastro público: cria um pedido de cadastro, que um admin aprova ou recusa. */
export function registerUserService({ body }: PayloadBody<RegisterUserServicePayload>) {
  return inject(AppClient).post<null>('/api/auth/register', { body });
}
