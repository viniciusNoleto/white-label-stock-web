import { expect, test } from '@playwright/test';
import { api, row, uniqueName } from './support/helpers';

test('movements: records the entry and the adjustment of a lot, newest first', async ({ page, request }) => {
  const unit = await api.unit(request, uniqueName('unit'), 'kg');
  const sku = uniqueName('far').toUpperCase();
  const flour = await api.product(request, { name: uniqueName('farinha'), sku, unit_id: unit.id, is_atomic: false });
  const [lot] = await api.items(request, { product_id: flour.id, quantity: 10 });

  await api.updateItem(request, lot.id, { quantity_subtract: 2.5 });

  await page.goto(`/inventory/items?code=${lot.code}`);

  // Atalho da linha do item → movimentações filtradas pelo código.
  await row(page, lot.code).getByRole('button', { name: 'Ver movimentações' }).click();
  await expect(page).toHaveURL(new RegExp(`/inventory/movements\\?search=${lot.code}`));

  const rows = page.getByRole('row').filter({ hasText: lot.code });
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText('Ajuste');
  await expect(rows.nth(0)).toContainText('−2.5 kg');
  await expect(rows.nth(0)).toContainText('7.5 kg');
  await expect(rows.nth(1)).toContainText('Entrada');
  await expect(rows.nth(1)).toContainText('+10 kg');
  await expect(rows.nth(1)).toContainText('e2e-user');

  // Filtro por tipo vai para a URL.
  await page.getByRole('combobox').filter({ hasText: 'Todos os tipos' }).click();
  await page.getByRole('option', { name: 'Entrada', exact: true }).click();
  await expect(page).toHaveURL(/[?&]type=entry/);
  await expect(rows).toHaveCount(1);
});
