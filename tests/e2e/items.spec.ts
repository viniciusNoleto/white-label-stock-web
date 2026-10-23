import { expect, test, type Page } from '@playwright/test';
import { api, expectNotification, row, selectOption, uniqueName } from './support/helpers';

async function search(page: Page, term: string) {
  await page.getByPlaceholder('Buscar por nome...').fill(term);
  await expect(page.getByRole('row')).toHaveCount(2); // header + the matching item
}

test.describe('inventory items', () => {
  test('create an item with unit, quantity, storage and category', async ({ page, request }) => {
    const unit = await api.unit(request, uniqueName('kg'), 'kg');
    const storage = await api.storage(request);
    const category = await api.category(request);
    const name = uniqueName('parafuso');
    await page.goto('/inventory/items');

    await page.getByRole('button', { name: 'Novo Item' }).click();
    const dialog = page.getByRole('dialog', { name: 'Novo Item de Inventário' });
    await dialog.getByRole('textbox', { name: 'Nome' }).fill(name);
    await selectOption(page, dialog.getByRole('combobox', { name: 'Unidade' }), unit.name);
    await dialog.getByLabel('Quantidade inicial').fill('12.5');
    await selectOption(page, dialog.getByRole('combobox', { name: 'Armazenamento' }), storage.name);
    await selectOption(page, dialog.getByRole('combobox', { name: 'Categorias' }), category.name);
    await page.keyboard.press('Escape');
    await dialog.getByRole('button', { name: 'Salvar' }).click();

    await expectNotification(page, 'Item criado com sucesso.');
    await search(page, name);
    const created = row(page, name);
    await expect(created).toContainText('12.5');
    await expect(created).toContainText('kg');
    await expect(created).toContainText(storage.name);
    await expect(created).toContainText(category.name);
  });

  test('search filters the table', async ({ page, request }) => {
    const unit = await api.unit(request);
    const a = await api.item(request, { name: uniqueName('alfa'), unit_id: unit.id });
    const b = await api.item(request, { name: uniqueName('beta'), unit_id: unit.id });
    await page.goto('/inventory/items');

    await search(page, a.name);
    await expect(row(page, b.name)).toHaveCount(0);

    await search(page, b.name);
    await expect(row(page, a.name)).toHaveCount(0);
  });

  test('update quantity by setting, adding and subtracting', async ({ page, request }) => {
    const unit = await api.unit(request);
    const item = await api.item(request, { name: uniqueName('cabo'), unit_id: unit.id, quantity: 10 });
    await page.goto('/inventory/items');
    await search(page, item.name);
    const dialog = page.getByRole('dialog', { name: 'Editar Quantidade' });

    await row(page, item.name).getByTitle('Editar quantidade').click();
    await dialog.getByRole('textbox', { name: 'Nova quantidade' }).fill('20');
    await expect(dialog).toContainText('Nova quantidade: 20');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expectNotification(page, 'Quantidade atualizada com sucesso.');
    await expect(row(page, item.name).getByTitle('Editar quantidade')).toHaveText('20');

    await row(page, item.name).getByTitle('Editar quantidade').click();
    await dialog.getByText('Somar').click();
    await dialog.getByRole('textbox', { name: 'Valor' }).fill('5');
    await expect(dialog).toContainText('Nova quantidade: 25');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(row(page, item.name).getByTitle('Editar quantidade')).toHaveText('25');

    await row(page, item.name).getByTitle('Editar quantidade').click();
    await dialog.getByText('Subtrair').click();
    await dialog.getByRole('textbox', { name: 'Valor' }).fill('100');
    await expect(dialog).toContainText('Nova quantidade: 0');
    await dialog.getByRole('textbox', { name: 'Valor' }).fill('7');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(row(page, item.name).getByTitle('Editar quantidade')).toHaveText('18');
  });

  test('rename an item and change its storage', async ({ page, request }) => {
    const unit = await api.unit(request);
    const storage = await api.storage(request);
    const item = await api.item(request, { name: uniqueName('porca'), unit_id: unit.id });
    const renamed = `${item.name}-m8`;
    await page.goto('/inventory/items');
    await search(page, item.name);

    await row(page, item.name).getByTitle('Editar nome').click();
    const nameDialog = page.getByRole('dialog', { name: 'Editar Nome' });
    await nameDialog.getByLabel('Nome').fill(renamed);
    await nameDialog.getByRole('button', { name: 'Salvar' }).click();
    await expectNotification(page, 'Nome atualizado com sucesso.');
    await search(page, renamed);

    await row(page, renamed).getByTitle('Editar armazenamento').click();
    const storageDialog = page.getByRole('dialog', { name: 'Editar Armazenamento' });
    await selectOption(page, storageDialog.getByRole('combobox', { name: 'Armazenamento' }), storage.name);
    await storageDialog.getByRole('button', { name: 'Salvar' }).click();
    await expectNotification(page, 'Armazenamento atualizado com sucesso.');
    await expect(row(page, renamed)).toContainText(storage.name);
  });

  test('create a composite item and build it consuming components', async ({ page, request }) => {
    const unit = await api.unit(request);
    const wood = await api.item(request, { name: uniqueName('madeira'), unit_id: unit.id, quantity: 10 });
    const chairName = uniqueName('cadeira');
    await page.goto('/inventory/items');

    await page.getByRole('button', { name: 'Novo Item' }).click();
    const create = page.getByRole('dialog', { name: 'Novo Item de Inventário' });
    await create.getByRole('textbox', { name: 'Nome' }).fill(chairName);
    await selectOption(page, create.getByRole('combobox', { name: 'Unidade' }), unit.name);
    await selectOption(page, create.getByPlaceholder('Selecione um item'), wood.name);
    await create.getByPlaceholder('Digite uma quantidade').last().fill('3');
    // the "add component" ActionIcon is the only filled one in the dialog
    const addComponent = create.locator('.mantine-ActionIcon-root[data-variant="filled"]');
    await expect(addComponent).toBeEnabled();
    await addComponent.click();
    await expect(create.getByText(wood.name, { exact: true })).toBeVisible();
    await expect(create.getByText('Nenhum componente adicionado.')).toBeHidden();
    await create.getByRole('button', { name: 'Salvar' }).click();
    await expectNotification(page, 'Item criado com sucesso.');

    await search(page, chairName);
    await row(page, chairName).getByRole('button', { name: 'Construir' }).click();
    const build = page.getByRole('dialog', { name: `Construir: ${chairName}` });
    await expect(build).toContainText('Necessário: 3');
    await expect(build).toContainText('Disponível: 10');
    await expect(build).toContainText('Máx. possível: 3');
    await build.getByLabel('Quantidade a construir').fill('2');
    await expect(build).toContainText('Necessário: 6');
    await build.getByRole('button', { name: 'Construir' }).click();
    await expectNotification(page, '2 unidade(s) construída(s) com sucesso.');
    await expect(row(page, chairName).getByTitle('Editar quantidade')).toHaveText('2');

    await search(page, wood.name);
    await expect(row(page, wood.name).getByTitle('Editar quantidade')).toHaveText('4');
    await expect(row(page, wood.name).getByRole('button', { name: 'Construir' })).toHaveCount(0);

    await search(page, chairName);
    await row(page, chairName).getByRole('button', { name: 'Construir' }).click();
    await expect(build).toContainText('Máx. possível: 1');
    // the input clamps to the max buildable amount on blur, so the UI never requests more than the stock allows
    await build.getByLabel('Quantidade a construir').fill('5');
    await build.getByLabel('Quantidade a construir').blur();
    await expect(build.getByLabel('Quantidade a construir')).toHaveValue('1');
    await build.getByRole('button', { name: 'Construir' }).click();
    await expectNotification(page, '1 unidade(s) construída(s) com sucesso.');

    await row(page, chairName).getByRole('button', { name: 'Construir' }).click();
    await expect(build).toContainText('Máx. possível: 0');
    await expect(build.getByRole('button', { name: 'Construir' })).toBeDisabled();
  });
});
