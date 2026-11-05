import { expect, test } from '@playwright/test';
import { E2E_REGULAR_USER } from './support/db';
import { dialog, expectToast, row, signIn, uniqueName } from './support/helpers';

const PASSWORD = 'senha-segura-123';

function person(label: string) {
  const name = uniqueName(label);
  return { name, email: `${name}@example.com`, password: PASSWORD };
}

test.describe('public registration', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('requests access from the login page and waits for approval', async ({ page }) => {
    const someone = person('signup');

    await page.goto('/auth/login');
    await page.getByRole('link', { name: 'Solicitar acesso' }).click();
    await expect(page).toHaveURL(/\/auth\/register$/);

    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expect(page.getByText('Nome é obrigatório')).toBeVisible();

    await page.getByLabel(/^\s*Nome/).fill(someone.name);
    await page.getByLabel('E-mail').fill(someone.email);
    await page.getByLabel(/^\s*Senha/).fill('curta');
    await page.getByLabel(/Confirmar senha/).fill('outra');
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expect(page.getByText('A senha deve ter pelo menos 8 caracteres')).toBeVisible();
    await expect(page.getByText('As senhas não conferem')).toBeVisible();

    await page.getByLabel(/^\s*Senha/).fill(someone.password);
    await page.getByLabel(/Confirmar senha/).fill(someone.password);
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expectToast(page, 'Pedido de cadastro enviado. Aguarde a aprovação de um administrador.');
    await expect(page.getByRole('status').filter({ hasText: 'Pedido enviado' })).toContainText(someone.email);

    // Ainda não aprovado: o login avisa, em vez de "senha inválida".
    await page.getByRole('link', { name: 'Voltar para o login' }).click();
    await page.getByLabel('E-mail').fill(someone.email);
    await page.getByLabel(/Senha/).fill(someone.password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expectToast(page, 'Seu cadastro ainda aguarda a aprovação de um administrador.');
    await expect(page).toHaveURL(/\/auth\/login$/);

    // O mesmo e-mail não entra duas vezes na fila.
    await page.goto('/auth/register');
    await page.getByLabel(/^\s*Nome/).fill(someone.name);
    await page.getByLabel('E-mail').fill(someone.email);
    await page.getByLabel(/^\s*Senha/).fill(someone.password);
    await page.getByLabel(/Confirmar senha/).fill(someone.password);
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expectToast(page, 'Já existe um usuário ou pedido de cadastro com este e-mail.');
  });
});

test('admin approves a request and the new user signs in', async ({ page, request, browser, baseURL }) => {
  const someone = person('approve');
  expect((await request.post('/api/auth/register', { data: someone })).status()).toBe(201);

  await page.goto('/inventory/items');
  await page.getByRole('link', { name: 'Pedidos de cadastro' }).click();
  await expect(page.getByRole('heading', { name: 'Pedidos de cadastro' })).toBeVisible();

  await row(page, someone.email).getByRole('button', { name: 'Aprovar' }).click();
  await expect(dialog(page)).toContainText(someone.name);
  await dialog(page).getByRole('button', { name: 'Aprovar' }).click();
  await expectToast(page, 'Cadastro aprovado. O usuário já pode entrar.');
  await expect(row(page, someone.email)).toHaveCount(0);

  await page.getByRole('link', { name: 'Usuários' }).click();
  await expect(row(page, someone.email)).toContainText('Usuário');

  // A pessoa aprovada entra com a senha que escolheu no cadastro — e não vê a administração.
  const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
  const newcomer = await context.newPage();
  await newcomer.goto('/auth/login');
  await newcomer.getByLabel('E-mail').fill(someone.email);
  await newcomer.getByLabel(/Senha/).fill(someone.password);
  await newcomer.getByRole('button', { name: 'Entrar' }).click();
  await expect(newcomer).toHaveURL(/\/inventory\/items$/);
  await expect(newcomer.getByRole('link', { name: 'Usuários' })).toHaveCount(0);
  await context.close();
});

test('admin rejects a request, which is deleted', async ({ page, request }) => {
  const someone = person('reject');
  expect((await request.post('/api/auth/register', { data: someone })).status()).toBe(201);

  await page.goto('/inventory/registration-requests');
  await row(page, someone.email).getByRole('button', { name: 'Recusar' }).click();
  await dialog(page).getByRole('button', { name: 'Recusar' }).click();
  await expectToast(page, 'Pedido de cadastro recusado e excluído.');
  await expect(row(page, someone.email)).toHaveCount(0);

  const login = await request.post('/api/auth/login', { data: { email: someone.email, password: someone.password } });
  expect(login.status()).toBe(401);

  // Recusado, pode pedir de novo.
  expect((await request.post('/api/auth/register', { data: someone })).status()).toBe(201);
});

test('admin deletes a regular user, who loses access; admins cannot be deleted', async ({ page, request, browser, baseURL }) => {
  const someone = person('delete');
  await request.post('/api/auth/register', { data: someone });

  // Aprovado pela tela e já com uma sessão aberta.
  await page.goto('/inventory/registration-requests');
  await row(page, someone.email).getByRole('button', { name: 'Aprovar' }).click();
  await dialog(page).getByRole('button', { name: 'Aprovar' }).click();
  await expectToast(page, 'Cadastro aprovado. O usuário já pode entrar.');

  const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
  await signIn(context, baseURL as string, someone);
  const victim = await context.newPage();
  await victim.goto('/inventory/items');
  await expect(victim.getByRole('heading', { name: 'Itens' })).toBeVisible();

  await page.goto('/inventory/users');
  await page.getByPlaceholder('Buscar por nome ou e-mail...').fill('e2e-user@');
  await expect(row(page, 'e2e-user@stockflow.local')).toContainText('Administrador');
  await expect(row(page, 'e2e-user@stockflow.local').getByRole('button', { name: 'Excluir' })).toHaveCount(0);

  await page.getByPlaceholder('Buscar por nome ou e-mail...').fill(someone.email);
  await row(page, someone.email).getByRole('button', { name: 'Excluir' }).click();
  await expect(dialog(page)).toContainText(someone.name);
  await dialog(page).getByRole('button', { name: 'Excluir' }).click();
  await expectToast(page, 'Usuário excluído. O acesso dele foi encerrado.');
  await expect(row(page, someone.email)).toHaveCount(0);

  // A sessão aberta cai na próxima navegação.
  await victim.goto('/inventory/units');
  await expect(victim).toHaveURL(/\/auth\/login$/);
  await context.close();
});

test.describe('regular user', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('does not see nor reach the administration', async ({ page, context, baseURL }) => {
    await signIn(context, baseURL as string, E2E_REGULAR_USER);

    await page.goto('/inventory/items');
    await expect(page.getByRole('heading', { name: 'Itens' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Usuários' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Pedidos de cadastro' })).toHaveCount(0);

    await page.goto('/inventory/users');
    await expect(page).toHaveURL(/\/inventory\/items$/);

    await page.goto('/inventory/registration-requests');
    await expect(page).toHaveURL(/\/inventory\/items$/);

    const { cookies } = await context.storageState();
    const token = cookies.find((cookie) => cookie.name === 'access_token')!.value;
    const response = await context.request.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
    expect(response.status()).toBe(403);
  });
});
