import { expect, test } from '@playwright/test';
import { addDaysISO, todayISO } from '../../src/utils/date';
import { api, row, uniqueName } from './support/helpers';

test('dashboard: is the inventory home and points to expired stock', async ({ page, request }) => {
  const unit = await api.unit(request, uniqueName('unit'), 'kg');
  const sku = uniqueName('lei').toUpperCase();
  const milk = await api.product(request, { name: uniqueName('leite'), sku, unit_id: unit.id, is_atomic: false, shelf_life_days: 1 });

  // Produzido há 3 dias, validade de 1 dia: vencido no estoque.
  await api.items(request, { product_id: milk.id, quantity: 4, produced_at: addDaysISO(todayISO(), -3) });

  await page.goto('/inventory');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Painel', level: 1 })).toBeVisible();

  // Alerta com link para os itens vencidos.
  const alert = page.getByRole('link', { name: /vencidos? ainda (está|estão) no estoque/ });
  await expect(alert).toBeVisible();

  // Vencimentos: o produto aparece com a quantidade vencida e leva à lista filtrada.
  await expect(row(page, milk.name)).toContainText('4 kg');
  await row(page, milk.name).getByRole('link', { name: milk.name }).click();
  await expect(page).toHaveURL(new RegExp(`/inventory/items\\?.*product=${milk.id}`));
  await expect(page).toHaveURL(/expiration=expired/);

  // Período vai para a URL.
  await page.goto('/dashboard');
  await page.getByRole('button', { name: '7 dias' }).click();
  await expect(page).toHaveURL(/period=7/);
  await expect(page.getByRole('button', { name: '7 dias' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/Movimentações por dia/)).toBeVisible();
});
