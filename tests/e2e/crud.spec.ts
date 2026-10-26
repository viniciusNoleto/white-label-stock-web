import { expect, test } from '@playwright/test';
import { api, dialog, expectToast, row, uniqueName } from './support/helpers';

test('creates, edits and deletes a unit', async ({ page }) => {
  const name = uniqueName('unit');

  await page.goto('/inventory/units');
  await page.getByRole('button', { name: 'Nova Unidade' }).click();
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(dialog(page).getByText('Nome é obrigatório')).toBeVisible();

  await dialog(page).getByLabel(/Nome/).fill(name);
  await dialog(page).getByLabel(/Abreviação/).fill('cx');
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Unidade criada com sucesso.');
  await expect(row(page, name)).toContainText('cx');

  await row(page, name).getByRole('button', { name: 'Editar' }).click();
  await dialog(page).getByLabel(/Abreviação/).fill('caixa');
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(row(page, name)).toContainText('caixa');

  await row(page, name).getByRole('button', { name: 'Excluir' }).click();
  await expect(dialog(page)).toContainText(name);
  await dialog(page).getByRole('button', { name: 'Excluir' }).click();
  await expectToast(page, 'Unidade excluída com sucesso.');
  await expect(row(page, name)).toHaveCount(0);
});

test('creates a category with a swatch color', async ({ page }) => {
  const name = uniqueName('cat');

  await page.goto('/inventory/categories');
  await page.getByRole('button', { name: 'Nova Categoria' }).click();
  await dialog(page).getByLabel(/Nome/).fill(name);
  await dialog(page).getByRole('button', { name: '#2ECC71' }).click();
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();

  await expect(row(page, name)).toContainText('#2ECC71');
});

test('cannot delete a unit that is in use', async ({ page, request }) => {
  const unit = await api.unit(request);
  await api.item(request, { name: uniqueName('item'), unit_id: unit.id });

  await page.goto('/inventory/units');
  await row(page, unit.name).getByRole('button', { name: 'Excluir' }).click();
  await dialog(page).getByRole('button', { name: 'Excluir' }).click();

  await expectToast(page, 'Esta unidade está em uso por itens do inventário.');
});

test('creates and edits a storage', async ({ page }) => {
  const name = uniqueName('storage');

  await page.goto('/inventory/storages');
  await page.getByRole('button', { name: 'Novo Armazenamento' }).click();
  await dialog(page).getByLabel(/Nome/).fill(name);
  await dialog(page).getByLabel(/Descrição/).fill('Prateleira 3');
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();

  await expect(row(page, name)).toContainText('Prateleira 3');
});
