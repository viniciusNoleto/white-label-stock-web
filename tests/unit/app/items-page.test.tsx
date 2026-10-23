import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notifications } from '@mantine/notifications';
import { renderWithProviders } from '../../support/render';
import { mockFetch, ok, page } from '../../support/fetch';
import { itemChair, itemWood, storageA, storageB, unitKg, categoryRaw } from '../../support/fixtures';
import ItemsPage from '@/app/inventory/items/page';

function setup(extra: Record<string, unknown> = {}) {
  vi.spyOn(notifications, 'show').mockImplementation(() => '');
  return mockFetch({
    'GET /api/inventory-items': (req: { search: URLSearchParams }) =>
      page(req.search.get('search') ? [itemChair] : [itemWood, itemChair], { last_page: 3, page: Number(req.search.get('page') ?? 1) }),
    'GET /api/units': ok([unitKg]),
    'GET /api/item-categories': ok([categoryRaw]),
    'GET /api/storages': ok([storageA, storageB]),
    ...extra,
  });
}

function rowOf(text: string) {
  return screen.getByText(text, { selector: 'span' }).closest('tr')!;
}

async function closeDialog() {
  await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Cancelar|Fechar/ }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
}

describe('Items page', () => {
  it('renders items with categories, quantity, unit and storage', async () => {
    const api = setup();
    renderWithProviders(<ItemsPage />);

    const wood = within(await screen.findByText('Madeira', { selector: 'span' }).then(el => el.closest('tr')!));
    expect(wood.getByText('Matéria-prima')).toBeInTheDocument();
    expect(wood.getByText('10')).toBeInTheDocument();
    expect(wood.getByText('kg')).toBeInTheDocument();
    expect(wood.getByText('Depósito A')).toBeInTheDocument();
    expect(wood.queryByRole('button', { name: 'Construir' })).toBeNull();

    const chair = within(rowOf('Cadeira'));
    expect(chair.getAllByText('—')).toHaveLength(2);
    expect(chair.getByRole('button', { name: 'Construir' })).toBeInTheDocument();

    expect(Object.fromEntries(api.calls('GET /api/inventory-items')[0].search)).toEqual({ page: '1', per_page: '15' });
  });

  it('debounces the search, resets to page 1 and paginates', async () => {
    const api = setup();
    renderWithProviders(<ItemsPage />);
    await screen.findByText('Madeira', { selector: 'span' });

    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await waitFor(() => expect(api.calls('GET /api/inventory-items').at(-1)!.search.get('page')).toBe('3'));

    await userEvent.type(screen.getByPlaceholderText('Buscar por nome...'), 'cad');
    await waitFor(() => expect(api.calls('GET /api/inventory-items').at(-1)!.search.get('search')).toBe('cad'), { timeout: 2000 });
    expect(api.calls('GET /api/inventory-items').at(-1)!.search.get('page')).toBe('1');
    await waitFor(() => expect(screen.queryByText('Madeira', { selector: 'span' })).toBeNull());
  });

  it('opens and closes every modal from the row shortcuts', async () => {
    setup();
    renderWithProviders(<ItemsPage />);
    await screen.findByText('Madeira', { selector: 'span' });

    await userEvent.click(screen.getByRole('button', { name: 'Novo Item' }));
    expect(await screen.findByRole('dialog', { name: 'Novo Item de Inventário' })).toBeInTheDocument();
    await closeDialog();

    await userEvent.click(within(rowOf('Madeira')).getByTitle('Editar quantidade'));
    expect(within(await screen.findByRole('dialog', { name: 'Editar Quantidade' })).getByText('Defina a nova quantidade para "Madeira".')).toBeInTheDocument();
    await closeDialog();

    await userEvent.click(within(rowOf('Madeira')).getByTitle('Editar nome'));
    expect(within(await screen.findByRole('dialog', { name: 'Editar Nome' })).getByLabelText(/Nome/)).toHaveValue('Madeira');
    await closeDialog();

    await userEvent.click(within(rowOf('Madeira')).getByTitle('Editar armazenamento'));
    expect(await screen.findByRole('dialog', { name: 'Editar Armazenamento' })).toBeInTheDocument();
    await closeDialog();

    await userEvent.click(within(rowOf('Cadeira')).getByRole('button', { name: 'Construir' }));
    expect(await screen.findByRole('dialog', { name: 'Construir: Cadeira' })).toBeInTheDocument();
    await closeDialog();
  });

  it('refetches and closes each modal after a successful mutation', async () => {
    const api = setup({
      'POST /api/inventory-items': ok({}, 'criado'),
      'PATCH /api/inventory-items/10': ok({}, 'ok'),
      'POST /api/inventory-items/11/build': ok({}, 'construído'),
    });
    renderWithProviders(<ItemsPage />);
    await screen.findByText('Madeira', { selector: 'span' });
    const lists = () => api.calls('GET /api/inventory-items').length;

    async function submitIn(dialogName: string | RegExp, button = 'Salvar') {
      const before = lists();
      const dialog = await screen.findByRole('dialog', { name: dialogName });
      await userEvent.click(within(dialog).getByRole('button', { name: button }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(lists()).toBeGreaterThan(before));
    }

    await userEvent.click(screen.getByRole('button', { name: 'Novo Item' }));
    const createDialog = await screen.findByRole('dialog');
    await userEvent.type(within(createDialog).getByLabelText(/^Nome/), 'Mesa');
    await userEvent.click(within(createDialog).getByRole('combobox', { name: /Unidade/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Quilograma' }));
    await submitIn('Novo Item de Inventário');

    await userEvent.click(within(rowOf('Madeira')).getByTitle('Editar quantidade'));
    await submitIn('Editar Quantidade');

    await userEvent.click(within(rowOf('Madeira')).getByTitle('Editar nome'));
    await submitIn('Editar Nome');

    await userEvent.click(within(rowOf('Madeira')).getByTitle('Editar armazenamento'));
    await submitIn('Editar Armazenamento');

    await userEvent.click(within(rowOf('Cadeira')).getByRole('button', { name: 'Construir' }));
    await submitIn('Construir: Cadeira', 'Construir');

    expect(api.calls('PATCH /api/inventory-items/10').map(c => c.body)).toEqual([{ quantity: 10 }, { name: 'Madeira' }, { storage_id: 1 }]);
    expect(api.calls('POST /api/inventory-items/11/build')[0].body).toEqual({ quantity: 1 });
  });

  it('handles an empty response', async () => {
    setup({ 'GET /api/inventory-items': ok(null) });
    renderWithProviders(<ItemsPage />);

    expect(await screen.findByText(/Nenhum item encontrado/)).toBeInTheDocument();
  });
});

describe('Items page modals close with Escape', () => {
  it('closes every modal', async () => {
    setup();
    renderWithProviders(<ItemsPage />);
    await screen.findByText('Madeira', { selector: 'span' });

    for (const open of [
      () => userEvent.click(screen.getByRole('button', { name: 'Novo Item' })),
      () => userEvent.click(within(rowOf('Madeira')).getByTitle('Editar quantidade')),
      () => userEvent.click(within(rowOf('Madeira')).getByTitle('Editar nome')),
      () => userEvent.click(within(rowOf('Madeira')).getByTitle('Editar armazenamento')),
      () => userEvent.click(within(rowOf('Cadeira')).getByRole('button', { name: 'Construir' })),
    ]) {
      await open();
      await screen.findByRole('dialog');
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    }
  });
});
