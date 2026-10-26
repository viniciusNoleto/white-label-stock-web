import { type APIRequestContext, expect, type Locator, type Page } from '@playwright/test';
import { E2E_PREFIX } from './db';

export function uniqueName(label: string) {
  return `${E2E_PREFIX}${label}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** Abre um `app-form-select` (Spartan) e escolhe a opção. */
export async function selectOption(page: Page, trigger: Locator, option: string) {
  await trigger.click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

export function row(page: Page, text: string) {
  return page.getByRole('row').filter({ hasText: text });
}

export function dialog(page: Page) {
  return page.getByRole('dialog');
}

export async function expectToast(page: Page, text: string | RegExp) {
  await expect(page.locator('[data-sonner-toast]').filter({ hasText: text }).first()).toBeVisible();
}

async function post<T>(request: APIRequestContext, url: string, data: object): Promise<T> {
  const response = await request.post(url, { data });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).data as T;
}

export const api = {
  unit: (request: APIRequestContext, name = uniqueName('unit'), abbreviation = 'un') =>
    post<{ id: number; name: string }>(request, '/api/units', { name, abbreviation }),
  category: (request: APIRequestContext, name = uniqueName('cat'), color_hex = '#2482ED') =>
    post<{ id: number; name: string }>(request, '/api/item-categories', { name, color_hex }),
  storage: (request: APIRequestContext, name = uniqueName('storage'), description?: string) =>
    post<{ id: number; name: string }>(request, '/api/storages', { name, description }),
  item: (request: APIRequestContext, body: { name: string; unit_id: number; quantity?: number; components?: { id: number; quantity_required: number }[] }) =>
    post<{ id: number; name: string }>(request, '/api/inventory-items', body),
};
