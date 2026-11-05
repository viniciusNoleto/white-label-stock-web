import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { IUser } from '@/resources/user/models/User';

/** Cria o usuário (comum) com a senha do pedido e exclui o pedido. */
export function approveRegistrationRequestService({ registrationRequestId }: { registrationRequestId: number }) {
  return inject(AppClient).post<IUser>(`/api/registration-requests/${registrationRequestId}/approve`);
}
