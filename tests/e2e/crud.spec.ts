import { expect, test } from '@playwright/test';
import { api, expectNotification, row, uniqueName } from './support/helpers';

test.describe('units', () => {
  test('create, edit and delete a unit', async ({ page }) => {
    const name = uniqueName('litro');
    const renamed = `${name}-ed`;
    await page.goto('/inventory/units');

    await page.getByRole('button', { name: 'Nova Unidade' }).click();
    const create = page.getByRole('dialog', { name: 'Nova Unidade' });
    await create.getByLabel('Nome').fill(name);
    await create.getByLabel('Abreviação').fill('L');
    await create.getByRole('button', { name: 'Salvar' }).click();
    await expectNotification(page, 'Unidade criada com sucesso.');
    await expect(create).toBeHidden();
    await expect(row(page, name)).toContainText('L');

    await row(page, name).getByRole('button', { name: 'Editar' }).click();
    const edit = page.getByRole('dialog', { name: 'Editar Unidade' });
    await expect(edit.getByLabel('Nome')).toHaveValue(name);
    await edit.getByLabel('Nome').fill(renamed);
    await edit.getByLabel('Abreviação').fill('lt');
    await edit.getByRole('button', { name: 'Salvar' }).click();
    await expectNotification(page, 'Unidade atualizada com sucesso.');
    await expect(row(page, renamed)).toContainText('lt');

    await row(page, renamed).getByRole('button', { name: 'Excluir' }).click();
    const remove = page.getByRole('dialog', { name: 'Excluir Unidade' });
    await expect(remove).toContainText(`"${renamed}"`);
    await remove.getByRole('button', { name: 'Excluir' }).click();
    await expectNotification(page, 'Unidade excluída com sucesso.');
    await expect(row(page, renamed)).toHaveCount(0);
  });

  test('required fields block submission', async ({ page }) => {
    await page.goto('/inventory/units');

    await page.getByRole('button', { name: 'Nova Unidade' }).click();
    const create = page.getByRole('dialog', { name: 'Nova Unidade' });
    await create.getByRole('button', { name: 'Salvar' }).click();

    await expect(create).toBeVisible();
    await create.getByRole('button', { name: 'Cancelar' }).click();
    await expect(create).toBeHidden();
  });

  test('deleting a unit in use reports the API error', async ({ page, request }) => {
    const unit = await api.unit(request);
    await api.item(request, { name: uniqueName('uses-unit'), unit_id: unit.id });
    await page.goto('/inventory/units');

    await row(page, unit.name).getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog', { name: 'Excluir Unidade' }).getByRole('button', { name: 'Excluir' }).click();

    await expectNotification(page, 'Erro ao excluir unidade.');
    await expect(row(page, unit.name)).toHaveCount(1);
  });
});

test.describe('categories', () => {
  test('create with a color, edit and delete a category', async ({ page }) => {
    const name = uniqueName('ferragens');
    const renamed = `${name}-ed`;
    await page.goto('/inventory/categories');

    await page.getByRole('button', { name: 'Nova Categoria' }).click();
    const create = page.getByRole('dialog', { name: 'Nova Categoria' });
    await expect(create.getByLabel('Cor')).toHaveValue('#6F1FF9');
    await create.getByLabel('Nome').fill(name);
    await create.getByLabel('Cor').fill('#2ecc71');
    await create.getByRole('button', { name: 'Salvar' }).click();
    await expectNotification(page, 'Categoria criada com sucesso.');
    await expect(row(page, name).getByText('#2ecc71')).toBeVisible();

    await row(page, name).getByRole('button', { name: 'Editar categoria' }).click();
    const edit = page.getByRole('dialog', { name: 'Editar Categoria' });
    await edit.getByLabel('Nome').fill(renamed);
    await edit.getByRole('button', { name: 'Salvar' }).click();
    await expectNotification(page, 'Categoria atualizada com sucesso.');

    await row(page, renamed).getByRole('button', { name: 'Excluir categoria' }).click();
    await page.getByRole('dialog', { name: 'Excluir Categoria' }).getByRole('button', { name: 'Excluir categoria' }).click();
    await expectNotification(page, 'Categoria excluída com sucesso.');
    await expect(row(page, renamed)).toHaveCount(0);
  });
});

test.describe('storages', () => {
  test('create, edit and delete a storage', async ({ page }) => {
    const name = uniqueName('galpao');
    await page.goto('/inventory/storages');

    await page.getByRole('button', { name: 'Novo Armazenamento' }).click();
    const create = page.getByRole('dialog', { name: 'Novo Armazenamento' });
    await create.getByLabel('Nome').fill(name);
    await create.getByLabel('Descrição').fill('Fundos do prédio');
    await create.getByRole('button', { name: 'Salvar' }).click();
    await expectNotification(page, 'Armazenamento criado com sucesso.');
    await expect(row(page, name)).toContainText('Fundos do prédio');

    await row(page, name).getByRole('button', { name: 'Editar armazenamento' }).click();
    const edit = page.getByRole('dialog', { name: 'Editar Armazenamento' });
    await expect(edit.getByLabel('Descrição')).toHaveValue('Fundos do prédio');
    await edit.getByLabel('Descrição').fill('Mezanino');
    await edit.getByRole('button', { name: 'Salvar' }).click();
    await expectNotification(page, 'Armazenamento atualizado com sucesso.');
    await expect(row(page, name)).toContainText('Mezanino');

    await row(page, name).getByRole('button', { name: 'Excluir armazenamento' }).click();
    await page.getByRole('dialog', { name: 'Excluir Armazenamento' }).getByRole('button', { name: 'Excluir' }).click();
    await expectNotification(page, 'Armazenamento excluído com sucesso.');
    await expect(row(page, name)).toHaveCount(0);
  });
});
