import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PaginatedResponse, PayloadQuery } from '@/shared/types/api';
import type { EDeliveryPackageStatus } from '../enums/DeliveryPackageStatus';
import type { IDeliveryPackage } from '../models/DeliveryPackage';

export type GetDeliveryPackagesServiceQuery = {
  status?: EDeliveryPackageStatus;
  page?: number;
  per_page?: number;
};

export function getDeliveryPackagesService({ query }: PayloadQuery<GetDeliveryPackagesServiceQuery> = {}) {
  return inject(AppClient).get<PaginatedResponse<IDeliveryPackage>>('/api/delivery-packages', { query });
}
