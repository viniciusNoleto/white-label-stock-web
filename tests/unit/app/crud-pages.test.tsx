import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notifications } from '@mantine/notifications';
import { vi } from 'vitest';
import { renderWithProviders } from '../../support/render';
import { mockFetch, ok } from '../../support/fetch';
import { categoryRaw, storageA, storageB, unitKg, unitUn } from '../../support/fixtures';
import UnitsPage from '@/app/inventory/units/page';
import CategoriesPage from '@/app/inventory/categories/page';
import StoragesPage from '@/app/inventory/storages/page';

function rowOf(text: string) {
  return screen.getByText(text).closest('tr')!;
}

describe('Units page', () => {
  it('lists, creates, edits and deletes units refetching after each mutation', async () => {
    vi.spyOn(notifications, 'show').mockImplementation(() => '');
    const api = mockFetch({
      'GET /api/units': ok([unitKg, unitUn]),
      'POST /api/units': ok({}, 'criada'),
      'PUT /api/units/1': ok({}, 'atualizada'),
      'DELETE /api/units/2': ok(null, 'excluída'),
    });
    renderWithProviders(<UnitsPage />);

    expect(screen.getByRole('heading', { name: 'Unidades' })).toBeInTheDocument();
    expect(await screen.findByText('Quilograma')).toBeInTheDocument();
    expect(within(rowOf('Unidade')).getByText('un')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Nova Unidade' }));
    const createDialog = await screen.findByRole('dialog', { name: 'Nova Unidade' });
    await userEvent.type(within(createDialog).getByLabelText(/Nome/), 'Litro');
    await userEvent.type(within(createDialog).getByLabelText(/Abreviação/), 'L');
    await userEvent.click(within(createDialog).getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Nova Unidade' })).toBeNull());

    await userEvent.click(within(rowOf('Quilograma')).getByRole('button', { name: 'Editar' }));
    const editDialog = await screen.findByRole('dialog', { name: 'Editar Unidade' });
    expect(within(editDialog).getByLabelText(/Nome/)).toHaveValue('Quilograma');
    await userEvent.click(within(editDialog).getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Editar Unidade' })).toBeNull());

    await userEvent.click(within(rowOf('Unidade')).getByRole('button', { name: 'Excluir' }));
    const deleteDialog = await screen.findByRole('dialog', { name: 'Excluir Unidade' });
    expect(within(deleteDialog).getByText(/"Unidade"/)).toBeInTheDocument();
    await userEvent.click(within(deleteDialog).getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Excluir Unidade' })).toBeNull());

    expect(api.calls('PUT /api/units/1')[0].body).toMatchObject({ name: 'Quilograma', abbreviation: 'kg' });
    expect(api.calls('DELETE /api/units/2')).toHaveLength(1);
    expect(api.calls('GET /api/units')).toHaveLength(4);
  });

  it('closes modals on cancel and shows the empty state', async () => {
    mockFetch({ 'GET /api/units': ok(null) });
    renderWithProviders(<UnitsPage />);

    expect(await screen.findByText(/Nenhuma unidade cadastrada/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Nova Unidade' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes the edit and delete modals via cancel', async () => {
    mockFetch({ 'GET /api/units': ok([unitKg]) });
    renderWithProviders(<UnitsPage />);

    await userEvent.click(within(await screen.findByText('Quilograma').then(el => el.closest('tr')!)).getByRole('button', { name: 'Editar' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await userEvent.click(within(rowOf('Quilograma')).getByRole('button', { name: 'Excluir' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

describe('Categories page', () => {
  it('renders color badges and runs the CRUD flows', async () => {
    vi.spyOn(notifications, 'show').mockImplementation(() => '');
    const api = mockFetch({
      'GET /api/item-categories': ok([categoryRaw]),
      'POST /api/item-categories': ok({}, 'criada'),
      'PUT /api/item-categories/1': ok({}, 'atualizada'),
      'DELETE /api/item-categories/1': ok(null, 'excluída'),
    });
    renderWithProviders(<CategoriesPage />);

    const badge = await screen.findByText('#123456');
    expect(badge.closest('.mantine-Badge-root')).toHaveStyle({ backgroundColor: '#123456' });

    await userEvent.click(screen.getByRole('button', { name: 'Nova Categoria' }));
    const createDialog = await screen.findByRole('dialog', { name: 'Nova Categoria' });
    await userEvent.type(within(createDialog).getByLabelText(/Nome/), 'Peças');
    await userEvent.click(within(createDialog).getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Nova Categoria' })).toBeNull());

    await userEvent.click(within(rowOf('Matéria-prima')).getByRole('button', { name: 'Editar categoria' }));
    const editDialog = await screen.findByRole('dialog', { name: 'Editar Categoria' });
    expect(within(editDialog).getByLabelText(/Nome/)).toHaveValue('Matéria-prima');
    await userEvent.click(within(editDialog).getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Editar Categoria' })).toBeNull());

    await userEvent.click(within(rowOf('Matéria-prima')).getByRole('button', { name: 'Excluir categoria' }));
    const deleteDialog = await screen.findByRole('dialog', { name: 'Excluir Categoria' });
    await userEvent.click(within(deleteDialog).getByRole('button', { name: 'Excluir categoria' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Excluir Categoria' })).toBeNull());

    expect(api.calls('POST /api/item-categories')[0].body).toEqual({ name: 'Peças', color_hex: '#6F1FF9' });
    expect(api.calls('GET /api/item-categories')).toHaveLength(4);
  });

  it('cancels every modal and shows the empty state', async () => {
    mockFetch({ 'GET /api/item-categories': ok([categoryRaw]) });
    renderWithProviders(<CategoriesPage />);
    await screen.findByText('Matéria-prima');

    for (const open of [
      () => userEvent.click(screen.getByRole('button', { name: 'Nova Categoria' })),
      () => userEvent.click(within(rowOf('Matéria-prima')).getByRole('button', { name: 'Editar categoria' })),
      () => userEvent.click(within(rowOf('Matéria-prima')).getByRole('button', { name: 'Excluir categoria' })),
    ]) {
      await open();
      await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    }
  });

  it('handles an empty response', async () => {
    mockFetch({ 'GET /api/item-categories': ok(null) });
    renderWithProviders(<CategoriesPage />);

    expect(await screen.findByText(/Nenhuma categoria cadastrada/)).toBeInTheDocument();
  });
});

describe('Storages page', () => {
  it('lists storages and runs the CRUD flows', async () => {
    vi.spyOn(notifications, 'show').mockImplementation(() => '');
    const api = mockFetch({
      'GET /api/storages': ok([storageA, storageB]),
      'POST /api/storages': ok({}, 'criado'),
      'PUT /api/storages/1': ok({}, 'atualizado'),
      'DELETE /api/storages/2': ok(null, 'excluído'),
    });
    renderWithProviders(<StoragesPage />);

    expect(await screen.findByText('Térreo')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Novo Armazenamento' }));
    const createDialog = await screen.findByRole('dialog', { name: 'Novo Armazenamento' });
    await userEvent.type(within(createDialog).getByLabelText(/Nome/), 'Galpão');
    await userEvent.click(within(createDialog).getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Novo Armazenamento' })).toBeNull());

    await userEvent.click(within(rowOf('Depósito A')).getByRole('button', { name: 'Editar armazenamento' }));
    const editDialog = await screen.findByRole('dialog', { name: 'Editar Armazenamento' });
    expect(within(editDialog).getByLabelText(/Descrição/)).toHaveValue('Térreo');
    await userEvent.click(within(editDialog).getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Editar Armazenamento' })).toBeNull());

    await userEvent.click(within(rowOf('Depósito B')).getByRole('button', { name: 'Excluir armazenamento' }));
    const deleteDialog = await screen.findByRole('dialog', { name: 'Excluir Armazenamento' });
    await userEvent.click(within(deleteDialog).getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Excluir Armazenamento' })).toBeNull());

    expect(api.calls('PUT /api/storages/1')[0].body).toEqual({ name: 'Depósito A', description: 'Térreo' });
    expect(api.calls('GET /api/storages')).toHaveLength(4);
  });

  it('cancels every modal and shows the empty state', async () => {
    mockFetch({ 'GET /api/storages': ok([storageA]) });
    renderWithProviders(<StoragesPage />);
    await screen.findByText('Depósito A');

    for (const open of [
      () => userEvent.click(screen.getByRole('button', { name: 'Novo Armazenamento' })),
      () => userEvent.click(within(rowOf('Depósito A')).getByRole('button', { name: 'Editar armazenamento' })),
      () => userEvent.click(within(rowOf('Depósito A')).getByRole('button', { name: 'Excluir armazenamento' })),
    ]) {
      await open();
      await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    }
  });

  it('handles an empty response', async () => {
    mockFetch({ 'GET /api/storages': ok(null) });
    renderWithProviders(<StoragesPage />);

    expect(await screen.findByText(/Nenhum armazenamento cadastrado/)).toBeInTheDocument();
  });
});

describe('modals close with Escape', () => {
  async function escapeCloses(open: () => Promise<void>) {
    await open();
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  }

  it.each([
    ['units', UnitsPage, 'GET /api/units', [unitKg], 'Quilograma', 'Nova Unidade', 'Editar', 'Excluir'],
    ['categories', CategoriesPage, 'GET /api/item-categories', [categoryRaw], 'Matéria-prima', 'Nova Categoria', 'Editar categoria', 'Excluir categoria'],
    ['storages', StoragesPage, 'GET /api/storages', [storageA], 'Depósito A', 'Novo Armazenamento', 'Editar armazenamento', 'Excluir armazenamento'],
  ] as const)('%s page', async (_, Page, route, rows, rowText, createLabel, editLabel, deleteLabel) => {
    mockFetch({ [route]: ok(rows) });
    renderWithProviders(<Page />);
    await screen.findByText(rowText);

    await escapeCloses(() => userEvent.click(screen.getByRole('button', { name: createLabel })));
    await escapeCloses(() => userEvent.click(within(rowOf(rowText)).getByRole('button', { name: editLabel })));
    await escapeCloses(() => userEvent.click(within(rowOf(rowText)).getByRole('button', { name: deleteLabel })));
  });
});
