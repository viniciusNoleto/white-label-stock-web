import { expect, test } from '@playwright/test';
import { api, dialog, expectToast, row, selectOption, uniqueName } from './support/helpers';

test('creates an item with a component, builds it and adjusts quantities', async ({ page, request }) => {
  const unit = await api.unit(request);
  const flour = await api.item(request, { name: uniqueName('flour'), unit_id: unit.id, quantity: 10 });
  const bread = uniqueName('bread');

  await page.goto('/inventory/items');
  await page.getByRole('button', { name: 'Novo Item' }).click();

  const modal = dialog(page);
  await modal.getByLabel(/^\s*Nome/).fill(bread);
  await selectOption(page, modal.getByRole('combobox', { name: /Unidade/ }), unit.name);
  await selectOption(page, modal.getByRole('combobox').filter({ hasText: 'Selecione um item' }), flour.name);
  await modal.getByLabel('Adicionar componente').click();
  await expect(modal.getByRole('listitem').filter({ hasText: flour.name })).toBeVisible();
  await modal.getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Item criado com sucesso.');

  await page.getByPlaceholder('Buscar por nome...').fill(bread);
  await expect(page.getByRole('row')).toHaveCount(2);

  await row(page, bread).getByRole('button', { name: 'Construir' }).click();
  await expect(dialog(page)).toContainText('Máx. possível: 10');
  await dialog(page).getByLabel(/Quantidade a construir/).fill('3');
  await dialog(page).getByRole('button', { name: 'Construir' }).click();
  await expectToast(page, '3 unidade(s) construída(s) com sucesso.');
  await expect(row(page, bread)).toContainText('3');

  await page.getByPlaceholder('Buscar por nome...').fill(flour.name);
  await expect(row(page, flour.name)).toContainText('7');

  await row(page, flour.name).getByTitle('Editar quantidade').click();
  await dialog(page).getByRole('button', { name: 'Somar' }).click();
  await dialog(page).getByLabel(/Valor/).fill('5');
  await expect(dialog(page)).toContainText('Nova quantidade: 12');
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(row(page, flour.name)).toContainText('12');

  await row(page, flour.name).getByRole('button', { name: 'Ajustar estoque' }).click();
  await expect(dialog(page)).toContainText('Quantidade atual: 12');
  await dialog(page).getByRole('button', { name: 'Subtrair' }).click();
  await dialog(page).getByLabel(/Valor/).fill('20');
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(dialog(page)).toContainText('Não é possível subtrair mais que o estoque atual (12)');
  await dialog(page).getByLabel(/Valor/).fill('4.5');
  await expect(dialog(page)).toContainText('Nova quantidade: 7.5');
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Quantidade atualizada com sucesso.');
  await expect(row(page, flour.name)).toContainText('7.5');
});

test('edits name, unit and categories in one modal, and the storage in another', async ({ page, request }) => {
  const unit = await api.unit(request);
  const otherUnit = await api.unit(request, uniqueName('unit'), 'cx');
  const category = await api.category(request);
  const storage = await api.storage(request);
  const item = await api.item(request, { name: uniqueName('cable'), unit_id: unit.id, quantity: 4 });
  const renamed = uniqueName('cable-renamed');

  await page.goto('/inventory/items');
  await page.getByPlaceholder('Buscar por nome...').fill(item.name);
  await row(page, item.name).getByRole('button', { name: 'Editar item' }).click();

  const modal = dialog(page);
  await expect(modal.getByLabel(/^\s*Nome/)).toHaveValue(item.name);
  await modal.getByLabel(/^\s*Nome/).fill(renamed);
  await selectOption(page, modal.getByRole('combobox', { name: /Unidade/ }), otherUnit.name);
  await selectOption(page, modal.getByRole('combobox', { name: /Categorias/ }), category.name);
  await modal.getByRole('heading', { name: 'Editar Item' }).click(); // a seleção múltipla fica aberta
  await modal.getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Item atualizado com sucesso.');

  await page.getByPlaceholder('Buscar por nome...').fill(renamed);
  await expect(row(page, renamed)).toContainText(category.name);
  await expect(row(page, renamed)).toContainText('cx');

  await row(page, renamed).getByRole('button', { name: 'Editar armazenamento' }).click();
  await selectOption(page, dialog(page).getByRole('combobox'), storage.name);
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Armazenamento atualizado com sucesso.');
  await expect(row(page, renamed)).toContainText(storage.name);
});

test('switches language and appearance', async ({ page }) => {
  await page.goto('/inventory/items');

  await page.getByRole('button', { name: 'Idioma' }).click();
  await page.getByRole('menuitemradio', { name: /English/ }).click();
  await expect(page.getByRole('heading', { name: 'Items' })).toBeVisible();

  await page.getByRole('button', { name: 'Appearance' }).click();
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  // o idioma vem do cookie: o SSR das páginas públicas já sai em inglês
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Go to Inventory' })).toBeVisible();

  await page.getByRole('button', { name: 'Language' }).click();
  await page.getByRole('menuitemradio', { name: /Português/ }).click();
});
