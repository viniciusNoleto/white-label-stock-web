import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IStorage } from '../models/Storage';

export type UpdateStorageServicePayload = {
  name: string;
  description?: string | null;
};

export function updateStorageService({ storageId, body }: PayloadBody<UpdateStorageServicePayload> & { storageId: number }) {
  return inject(AppClient).put<IStorage>(`/api/storages/${storageId}`, { body });
}
