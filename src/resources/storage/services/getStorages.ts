import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { IStorage } from '../models/Storage';

export function getStoragesService() {
  return inject(AppClient).get<IStorage[]>('/api/storages');
}
