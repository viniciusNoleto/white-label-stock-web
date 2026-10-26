import { expect, test } from '@playwright/test';
import { E2E_USER } from './support/db';

test.describe('authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('protected pages redirect to the login and back after signing in', async ({ page }) => {
    await page.goto('/inventory/units');
    await expect(page).toHaveURL(/\/auth\/login$/);

    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('E-mail é obrigatório')).toBeVisible();

    await page.getByLabel('E-mail').fill(E2E_USER.email);
    await page.getByLabel(/Senha/).fill('wrong-password');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('E-mail ou senha inválidos.')).toBeVisible();

    await page.getByLabel(/Senha/).fill(E2E_USER.password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/inventory\/items$/);
    await expect(page.getByRole('heading', { name: 'Itens' })).toBeVisible();
  });

  test('renews an expired access token transparently', async ({ page, context }) => {
    await page.goto('/auth/login');
    await page.getByLabel('E-mail').fill(E2E_USER.email);
    await page.getByLabel(/Senha/).fill(E2E_USER.password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/inventory\/items$/);

    // simula o browser descartando o cookie de access expirado
    const cookies = await context.cookies();
    await context.clearCookies();
    await context.addCookies(cookies.filter((cookie) => cookie.name !== 'access_token'));

    await page.goto('/inventory/units');
    await expect(page.getByRole('heading', { name: 'Unidades' })).toBeVisible();
    expect((await context.cookies()).some((cookie) => cookie.name === 'access_token')).toBe(true);
  });
});

test('signs out', async ({ page, context }) => {
  await page.goto('/inventory/items');
  await page.getByRole('button', { name: 'Menu do usuário' }).hover();
  await page.getByRole('button', { name: 'Sair' }).click();

  await expect(page).toHaveURL(/\/auth\/login$/);
  expect((await context.cookies()).filter((cookie) => cookie.name.endsWith('_token'))).toHaveLength(0);

  // a sessão salva foi revogada: refaz o login para os próximos testes
  await page.request.post('/api/auth/login', { data: { email: E2E_USER.email, password: E2E_USER.password } });
  await context.storageState({ path: './tests/e2e/.auth/state.json' });
});
