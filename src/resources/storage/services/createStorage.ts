import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IStorage } from '../models/Storage';

export type CreateStorageServicePayload = {
  name: string;
  description?: string | null;
};

export function createStorageService({ body }: PayloadBody<CreateStorageServicePayload>) {
  return inject(AppClient).post<IStorage>('/api/storages', { body });
}
