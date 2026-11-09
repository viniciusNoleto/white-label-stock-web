import { expect, test } from '@playwright/test';
import { api, dialog, expectToast, row, selectOption, uniqueName } from './support/helpers';

test('packages a bulk product, shows it as reserved and subtracts it on delivery', async ({ page, request }) => {
  const unit = await api.unit(request);
  const coco = await api.product(request, { name: uniqueName('coco'), unit_id: unit.id, is_atomic: false });
  const [lot] = await api.items(request, { product_id: coco.id, quantity: 10 });
  const notes = `${uniqueName('notes')}\nRua das Flores, 10`;

  await page.goto('/inventory/deliveries');
  await page.getByRole('button', { name: 'Novo Pacote' }).click();

  const modal = dialog(page);
  await modal.getByRole('button', { name: 'Salvar' }).click();
  await expect(modal).toContainText('Adicione ao menos um produto ao pacote');

  await selectOption(page, modal.getByRole('combobox').filter({ hasText: 'Selecione um produto' }), coco.name);
  await modal.getByLabel('Quantidade', { exact: true }).fill('12');
  await modal.getByLabel('Adicionar produto').click();
  await expect(modal.getByRole('listitem').filter({ hasText: coco.name })).toContainText('Livre: 10 un');
  await modal.getByLabel(`Quantidade de ${coco.name}`).fill('4');
  await modal.getByLabel('Anotações').fill(notes);
  await modal.getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Pacote criado com sucesso.');

  const packageRow = row(page, 'Rua das Flores');
  await expect(packageRow).toContainText(coco.name);
  await expect(packageRow).toContainText(lot.code);
  await expect(packageRow).toContainText('Pendente');

  await page.goto(`/inventory/items?product=${coco.id}`);
  await expect(row(page, lot.code).getByTitle('Quantidade reservada em pacotes de entrega pendentes')).toHaveText('4 reservado(s)');

  await page.goto('/inventory/deliveries');
  await row(page, 'Rua das Flores').getByRole('button', { name: 'Marcar como entregue' }).click();
  await expect(dialog(page)).toContainText('Em estoque: 10');
  await expect(dialog(page)).toContainText(`Separar: ${lot.code} ×4`);
  await dialog(page).getByRole('button', { name: 'Confirmar entrega' }).click();
  await expectToast(page, 'Pacote entregue. Os itens foram subtraídos do estoque.');
  await expect(page.getByRole('row').filter({ hasText: 'Rua das Flores' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Entregues' }).click();
  await expect(row(page, 'Rua das Flores')).toContainText('Entregue');

  await page.goto(`/inventory/items?product=${coco.id}`);
  await expect(row(page, lot.code).getByTitle('Ajustar quantidade')).toHaveText('6 un');
  await expect(row(page, lot.code).getByTitle('Quantidade reservada em pacotes de entrega pendentes')).toHaveCount(0);
});
