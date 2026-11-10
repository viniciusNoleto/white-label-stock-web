import { type APIRequestContext, type BrowserContext, expect, type Locator, type Page } from '@playwright/test';
import { E2E_PREFIX, E2E_USER } from './db';

/**
 * Login pela API e grava os tokens nos cookies do contexto — o mesmo que o
 * web faz depois do login (a API devolve os tokens no corpo, não em cookies).
 */
export async function signIn(context: BrowserContext, baseURL: string, user: { email: string; password: string } = E2E_USER) {
  const response = await context.request.post(`${baseURL}/api/auth/login`, { data: { email: user.email, password: user.password } });
  if (!response.ok()) throw new Error(`e2e login failed: ${response.status()}`);

  const { access_token, refresh_token, expires_in, refresh_expires_in } = (await response.json()).data;
  const now = Math.floor(Date.now() / 1000);

  await context.addCookies([
    { name: 'access_token', value: access_token, url: baseURL, sameSite: 'Lax', expires: now + expires_in },
    { name: 'refresh_token', value: refresh_token, url: baseURL, sameSite: 'Lax', expires: now + refresh_expires_in },
  ]);
}

/** `Authorization: Bearer` com o access token salvo no storageState do `request`. */
async function bearer(request: APIRequestContext): Promise<Record<string, string>> {
  const { cookies } = await request.storageState();
  const accessToken = cookies.find((cookie) => cookie.name === 'access_token')?.value;

  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export function uniqueName(label: string) {
  return `${E2E_PREFIX}${label}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** Abre um `app-form-select` (Spartan) e escolhe a opção. */
export async function selectOption(page: Page, trigger: Locator, option: string | RegExp) {
  await trigger.click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

/** Opção do select de produtos do pacote: `{nome} · {livre} {unidade}`. */
export function packageProductOption(name: string) {
  return new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} · `);
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
  const response = await request.post(url, { data, headers: await bearer(request) });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).data as T;
}

async function patch<T>(request: APIRequestContext, url: string, data: object): Promise<T> {
  const response = await request.patch(url, { data, headers: await bearer(request) });
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
  product: (
    request: APIRequestContext,
    body: { name: string; unit_id: number; sku?: string; is_atomic?: boolean; shelf_life_days?: number; components?: { id: number; quantity_required: number }[] },
  ) => post<{ id: number; name: string; sku: string | null }>(request, '/api/products', body),
  items: (
    request: APIRequestContext,
    body: { product_id: number; quantity?: number; produced_at?: string; storage_id?: number; code?: string; consume_components?: boolean },
  ) => post<{ items: { id: number; code: string }[] }>(request, '/api/items', body).then((data) => data.items),
  updateItem: (
    request: APIRequestContext,
    itemId: number,
    body: { quantity?: number; quantity_add?: number; quantity_subtract?: number; storage_id?: number | null },
  ) => patch<{ id: number; code: string }>(request, `/api/items/${itemId}`, body),
};
