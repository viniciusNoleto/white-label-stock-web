import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';

/** Recusar = excluir o pedido. */
export function rejectRegistrationRequestService({ registrationRequestId }: { registrationRequestId: number }) {
  return inject(AppClient).delete<null>(`/api/registration-requests/${registrationRequestId}`);
}
