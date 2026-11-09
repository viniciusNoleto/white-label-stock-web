import { expect, type Page, test } from '@playwright/test';
import { api, dialog, expectToast, row, selectOption, uniqueName } from './support/helpers';

function isoDaysFromToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function ptBrDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
}

function skuFor(label: string) {
  return uniqueName(label).toUpperCase();
}

async function searchOperation(page: Page, text: string) {
  await page.goto('/inventory/stock');
  await page.getByPlaceholder('Buscar por produto, SKU ou código...').fill(text);
}

test('furniture store: creates the cabinet recipe, produces 4 cabinets and sees them as one row', async ({ page, request }) => {
  const unit = await api.unit(request);
  const showroom = await api.storage(request, uniqueName('showroom'));
  const screw = await api.product(request, { name: uniqueName('parafuso'), sku: skuFor('par'), unit_id: unit.id, is_atomic: false });
  const white = await api.product(request, { name: uniqueName('mdf-branca'), sku: skuFor('mdfb'), unit_id: unit.id });
  const brown = await api.product(request, { name: uniqueName('mdf-castanho'), sku: skuFor('mdfc'), unit_id: unit.id });
  await api.items(request, { product_id: screw.id, quantity: 1000 });
  await api.items(request, { product_id: white.id, quantity: 20 });
  await api.items(request, { product_id: brown.id, quantity: 10 });

  const cabinet = uniqueName('armario-a');
  const cabinetSku = skuFor('arm');

  // Produto: armário modelo A com a receita (100 parafusos, 4 chapas brancas, 2 castanho).
  await page.goto('/inventory/products');
  await page.getByRole('button', { name: 'Novo Produto' }).click();

  const modal = dialog(page);
  await modal.getByLabel(/^\s*Nome/).fill(cabinet);
  await modal.getByLabel('SKU').fill(cabinetSku);
  await selectOption(page, modal.getByRole('combobox', { name: /Unidade/ }), unit.name);

  for (const [component, quantity] of [[screw.name, '100'], [white.name, '4'], [brown.name, '2']] as const) {
    await selectOption(page, modal.getByRole('combobox').filter({ hasText: 'Selecione um produto' }), component);
    await modal.getByPlaceholder('Quantidade').fill(quantity);
    await modal.getByLabel('Adicionar componente').click();
  }

  await expect(modal.getByRole('listitem')).toHaveCount(3);
  await modal.getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Produto criado com sucesso.');

  // Gerar 4 armários consumindo a receita (o padrão quando há receita).
  await page.getByPlaceholder('Buscar por nome ou SKU...').fill(cabinetSku);
  await expect(row(page, cabinet)).toContainText('100×');
  await row(page, cabinet).getByRole('button', { name: 'Gerar itens' }).click();

  const produce = dialog(page);
  await expect(produce.getByRole('switch')).toBeChecked();
  await expect(produce).toContainText('Dá para produzir até 5 com o estoque livre.');
  await produce.getByLabel(/Quantos itens/).fill('4');
  await expect(produce).toContainText(`4 códigos automáticos, a partir do próximo da sequência (${cabinetSku}-0001…)`);
  await selectOption(page, produce.getByRole('combobox', { name: /Armazenamento/ }), showroom.name);
  await produce.getByRole('button', { name: 'Gerar' }).click();
  await expectToast(page, '4 item(ns) gerado(s) com sucesso.');

  // Operação: os 4 armários numa linha só; o lote de parafusos aparece direto com o que sobrou.
  await searchOperation(page, cabinetSku);
  await expect(page.getByRole('row')).toHaveCount(2);
  await expect(row(page, cabinet)).toContainText('4 un');
  await expect(row(page, cabinet)).toContainText('4 itens com código próprio');
  await expect(row(page, cabinet)).toContainText(showroom.name);

  await searchOperation(page, screw.sku!);
  await expect(row(page, screw.name)).toContainText('600 un');
  await expect(row(page, screw.name)).toContainText(`Lote ${screw.sku}-0001`);

  // Itens: cada armário com seu código.
  await searchOperation(page, cabinetSku);
  await row(page, cabinet).getByRole('button', { name: 'Ver itens' }).click();
  await expect(page).toHaveURL(/\/inventory\/items\?product=\d+$/);

  for (const n of ['0001', '0002', '0003', '0004']) {
    await expect(row(page, `${cabinetSku}-${n}`)).toContainText(cabinet);
  }

  // Encontrar um armário pelo código e trocar o código dele.
  await page.getByPlaceholder('Buscar por código ou produto...').fill(`${cabinetSku}-0003`);
  await expect(page.getByRole('row')).toHaveCount(2);
  await row(page, `${cabinetSku}-0003`).getByRole('button', { name: 'Editar item' }).click();
  await dialog(page).getByLabel(/^\s*Código/).fill(`${cabinetSku}-VITRINE`);
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Item atualizado com sucesso.');
  await page.getByPlaceholder('Buscar por código ou produto...').fill('VITRINE');
  await expect(row(page, `${cabinetSku}-VITRINE`)).toBeVisible();
});

test('bakery: bakes 8 cakes at once with expiration and sells the first-expiring ones', async ({ page, request }) => {
  const unit = await api.unit(request);
  const kg = await api.unit(request, uniqueName('kg'), 'kg');
  const flour = await api.product(request, { name: uniqueName('farinha'), sku: skuFor('far'), unit_id: kg.id, is_atomic: false, shelf_life_days: 180 });
  await api.items(request, { product_id: flour.id, quantity: 10 });

  const cake = uniqueName('bolo-chocolate');
  const cakeSku = skuFor('bolo');

  // Produto: bolo atômico que vence 5 dias depois de produzido, com 0,3 kg de farinha.
  await page.goto('/inventory/products');
  await page.getByRole('button', { name: 'Novo Produto' }).click();

  const modal = dialog(page);
  await modal.getByLabel(/^\s*Nome/).fill(cake);
  await modal.getByLabel('SKU').fill(cakeSku);
  await selectOption(page, modal.getByRole('combobox', { name: /Unidade/ }), unit.name);
  await modal.getByLabel(/Validade \(dias\)/).fill('5');
  await selectOption(page, modal.getByRole('combobox').filter({ hasText: 'Selecione um produto' }), flour.name);
  await modal.getByPlaceholder('Quantidade').fill('0.3');
  await modal.getByLabel('Adicionar componente').click();
  await modal.getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Produto criado com sucesso.');

  // Produção em lote pela tela de itens: 8 bolos num formulário só.
  await page.goto('/inventory/items');
  await page.getByRole('button', { name: 'Gerar Itens' }).click();

  const produce = dialog(page);
  await selectOption(page, produce.getByRole('combobox', { name: /Produto/ }), cake);
  await expect(produce).toContainText(`Vence em ${ptBrDate(isoDaysFromToday(5))} (5 dias).`);
  await produce.getByLabel(/Quantos itens/).fill('8');
  await expect(produce).toContainText('Precisa 2.4 · livre 10');
  await produce.getByRole('button', { name: 'Gerar' }).click();
  await expectToast(page, '8 item(ns) gerado(s) com sucesso.');

  await page.getByPlaceholder('Buscar por código ou produto...').fill(cakeSku);
  await expect(page.getByRole('row')).toHaveCount(9);
  await expect(row(page, `${cakeSku}-0008`)).toContainText(ptBrDate(isoDaysFromToday(5)));

  // Vencem em 5 dias: entram no filtro "Vencendo"; nenhum vencido.
  await page.getByRole('button', { name: 'Vencendo' }).click();
  await expect(page.getByRole('row')).toHaveCount(9);
  await page.getByRole('button', { name: 'Vencidos' }).click();
  await expect(page.getByRole('row').filter({ hasText: cakeSku })).toHaveCount(0);

  // Operação: uma linha com 8; a farinha caiu para 7,6 kg.
  await searchOperation(page, cakeSku);
  await expect(row(page, cake)).toContainText('8 un');
  await searchOperation(page, flour.sku!);
  await expect(row(page, flour.name)).toContainText('7.6 kg');

  // Venda de 3 bolos: o pacote mostra quais códigos separar e a entrega tira só eles.
  await page.goto('/inventory/deliveries');
  await page.getByRole('button', { name: 'Novo Pacote' }).click();
  await selectOption(page, dialog(page).getByRole('combobox').filter({ hasText: 'Selecione um produto' }), cake);
  await dialog(page).getByLabel('Quantidade', { exact: true }).fill('3');
  await dialog(page).getByLabel('Adicionar produto').click();
  await expect(dialog(page).getByRole('listitem').filter({ hasText: cake })).toContainText('Livre: 8 un');
  await dialog(page).getByLabel('Anotações').fill(`${cakeSku} festa`);
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Pacote criado com sucesso.');
  await expect(row(page, `${cakeSku} festa`)).toContainText(`${cakeSku}-0001, ${cakeSku}-0002, ${cakeSku}-0003`);

  await searchOperation(page, cakeSku);
  await expect(row(page, cake)).toContainText('3 reservado(s)');

  await page.goto('/inventory/deliveries');
  await row(page, `${cakeSku} festa`).getByRole('button', { name: 'Marcar como entregue' }).click();
  await expect(dialog(page)).toContainText(`Separar: ${cakeSku}-0001, ${cakeSku}-0002, ${cakeSku}-0003`);
  await dialog(page).getByRole('button', { name: 'Confirmar entrega' }).click();
  await expectToast(page, 'Pacote entregue. Os itens foram subtraídos do estoque.');

  await searchOperation(page, cakeSku);
  await expect(row(page, cake)).toContainText('5 un');
});

test('adjusts a bulk lot, writes off an item and protects a product in use', async ({ page, request }) => {
  const unit = await api.unit(request);
  const screw = await api.product(request, { name: uniqueName('parafuso'), sku: skuFor('par'), unit_id: unit.id, is_atomic: false });
  const [lot] = await api.items(request, { product_id: screw.id, quantity: 12 });
  const chair = await api.product(request, { name: uniqueName('cadeira'), sku: skuFor('cad'), unit_id: unit.id });
  const [first] = await api.items(request, { product_id: chair.id, quantity: 2 });

  await page.goto(`/inventory/items?product=${screw.id}`);
  await row(page, lot.code).getByRole('button', { name: 'Ajustar quantidade' }).click();
  await dialog(page).getByRole('button', { name: 'Subtrair' }).click();
  await dialog(page).getByLabel(/Valor/).fill('20');
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(dialog(page)).toContainText('Não é possível subtrair mais que o estoque atual (12)');
  await dialog(page).getByLabel(/Valor/).fill('4.5');
  await expect(dialog(page)).toContainText('Nova quantidade: 7.5');
  await dialog(page).getByRole('button', { name: 'Salvar' }).click();
  await expectToast(page, 'Quantidade atualizada com sucesso.');
  await expect(row(page, lot.code)).toContainText('7.5 un');

  // Item atômico não tem ajuste de quantidade: sai do estoque excluindo.
  await page.goto(`/inventory/items?product=${chair.id}`);
  await expect(row(page, first.code).getByRole('button', { name: 'Ajustar quantidade' })).toHaveCount(0);
  await row(page, first.code).getByRole('button', { name: 'Excluir item' }).click();
  await expect(dialog(page)).toContainText(`Tirar o item "${first.code}" do estoque?`);
  await dialog(page).getByRole('button', { name: 'Excluir' }).click();
  await expectToast(page, 'Item excluído com sucesso.');
  await expect(row(page, first.code)).toHaveCount(0);

  // Produto com itens não pode ser excluído nem mudar de controle.
  await page.goto('/inventory/products');
  await page.getByPlaceholder('Buscar por nome ou SKU...').fill(chair.sku!);
  await row(page, chair.name).getByRole('button', { name: 'Editar produto' }).click();
  await expect(dialog(page)).toContainText('O produto já tem itens: o controle não pode mais mudar.');
  await dialog(page).getByRole('button', { name: 'Cancelar' }).click();
  await row(page, chair.name).getByRole('button', { name: 'Excluir produto' }).click();
  await dialog(page).getByRole('button', { name: 'Excluir' }).click();
  await expectToast(page, 'Este produto tem itens, faz parte da receita de outro produto ou está em pacotes de entrega.');
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
