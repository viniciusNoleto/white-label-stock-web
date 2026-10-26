import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';

export function deleteStorageService({ storageId }: { storageId: number }) {
  return inject(AppClient).delete<null>(`/api/storages/${storageId}`);
}
