import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';

export function deleteUserService({ userId }: { userId: number }) {
  return inject(AppClient).delete<null>(`/api/users/${userId}`);
}
