import type { SupportedLocale } from '@/shared/constants/locale';

export type ApiMessage = Record<SupportedLocale, string>;

export type ApiResponse<T> = {
  success: boolean;
  message: ApiMessage;
  data: T;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginatedMeta;
};

export type PaginatedMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type PayloadBody<T extends object> = {
  body: T;
};

export type PayloadQuery<T extends object> = {
  query?: T;
};
