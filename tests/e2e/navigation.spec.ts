import { expect, test } from '@playwright/test';

test.describe('navigation & preferences', () => {
  test('home page leads to the inventory, which redirects to items', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'StockFlow' })).toBeVisible();
    await page.getByRole('link', { name: 'Acessar Inventário' }).click();

    await expect(page).toHaveURL(/\/inventory\/items$/);
    await expect(page.getByRole('heading', { name: 'Itens' })).toBeVisible();
  });

  test('sidebar navigates between every section', async ({ page }) => {
    await page.goto('/inventory/items');
    const nav = page.getByRole('navigation');

    for (const [label, path, heading] of [
      ['Categorias', '/inventory/categories', 'Categorias'],
      ['Unidades', '/inventory/units', 'Unidades'],
      ['Armazenamentos', '/inventory/storages', 'Armazenamentos'],
      ['Itens', '/inventory/items', 'Itens'],
    ]) {
      await nav.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    }

    await page.getByRole('link', { name: 'StockFlow' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('language switch translates the UI and persists across reloads', async ({ page }) => {
    await page.goto('/inventory/units');

    await page.getByRole('button', { name: 'Idioma' }).hover();
    await page.getByRole('button', { name: 'English (US)' }).click();
    await expect(page.getByRole('heading', { name: 'Units', level: 1 })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Units', level: 1 })).toBeVisible();

    await page.getByRole('button', { name: 'Language' }).hover();
    await page.getByRole('button', { name: 'Español (México)' }).click();
    await expect(page.getByRole('heading', { name: 'Unidades', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nueva Unidad' })).toBeVisible();

    await page.getByRole('button', { name: 'Idioma' }).hover();
    await page.getByRole('button', { name: 'Português (Brasil)' }).click();
    await expect(page.getByRole('button', { name: 'Nova Unidade' })).toBeVisible();
  });

  test('color scheme switch applies dark and light modes', async ({ page }) => {
    await page.goto('/inventory/items');
    const html = page.locator('html');

    await page.getByRole('button', { name: 'Aparência' }).hover();
    await page.getByRole('button', { name: 'Escuro' }).click();
    await expect(html).toHaveAttribute('data-mantine-color-scheme', 'dark');

    await page.getByRole('button', { name: 'Claro' }).click();
    await expect(html).toHaveAttribute('data-mantine-color-scheme', 'light');
  });
});
