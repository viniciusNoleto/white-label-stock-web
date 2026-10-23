import { describe, expect, it } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fail, mockFetch, ok, page } from '../../support/fetch';
import { renderLogic, submitBypassingNativeValidation } from '../../support/logic';
import { itemChair, itemWood, storageA, storageB, unitKg, unitUn, categoryRaw } from '../../support/fixtures';
import { useCreateInventoryItemLogicData, CreateInventoryItemLogicComponent } from '@/resources/inventory-item/logics/CreateInventoryItem';
import { useUpdateInventoryItemNameLogicData, UpdateInventoryItemNameLogicComponent } from '@/resources/inventory-item/logics/UpdateInventoryItemName';
import { useUpdateInventoryItemStorageLogicData, UpdateInventoryItemStorageLogicComponent } from '@/resources/inventory-item/logics/UpdateInventoryItemStorage';
import { useUpdateQuantityLogicData, UpdateQuantityLogicComponent } from '@/resources/inventory-item/logics/UpdateQuantity';
import { useBuildInventoryItemLogicData, BuildInventoryItemLogicComponent } from '@/resources/inventory-item/logics/BuildInventoryItem';

const nullMessage = { success: false, message: null, data: null };

async function pick(label: string | RegExp, option: string) {
  const input = label === 'Selecione um item' ? screen.getByPlaceholderText(label) : screen.getByRole('combobox', { name: label });
  await userEvent.click(input);
  await userEvent.click(await screen.findByRole('option', { name: option }));
}

describe('CreateInventoryItem logic', () => {
  function lookups(extra: Record<string, unknown> = {}) {
    return mockFetch({
      'GET /api/units': ok([unitKg, unitUn]),
      'GET /api/item-categories': ok([categoryRaw]),
      'GET /api/storages': ok([storageA, storageB]),
      'GET /api/inventory-items': page([itemWood, itemChair]),
      ...extra,
    });
  }

  it('requires name and unit', async () => {
    const api = lookups();
    const { container } = renderLogic(useCreateInventoryItemLogicData, CreateInventoryItemLogicComponent);

    submitBypassingNativeValidation(container);

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Unidade é obrigatória')).toBeInTheDocument();
    expect(api.calls('POST /api/inventory-items')).toHaveLength(0);
  });

  it('creates a composite item with storage, categories and components', async () => {
    const api = lookups({ 'POST /api/inventory-items': ok({}, 'Item criado') });
    const { onSuccess, show } = renderLogic(useCreateInventoryItemLogicData, CreateInventoryItemLogicComponent);

    await userEvent.type(screen.getByLabelText(/^Nome/), 'Mesa');
    await pick(/Unidade/, 'Unidade');
    const qty = screen.getByLabelText('Quantidade inicial');
    await userEvent.clear(qty);
    await userEvent.type(qty, '2');
    await pick(/Armazenamento/, 'Depósito B');

    await userEvent.click(screen.getByRole('combobox', { name: /Categorias/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Matéria-prima' }));

    expect(screen.getByText('Nenhum componente adicionado.')).toBeInTheDocument();
    const addButton = document.querySelector('[data-icon="lucide:plus"]')!.closest('button')!;
    expect(addButton).toBeDisabled();

    await pick('Selecione um item', 'Madeira');
    const [newQty] = screen.getAllByPlaceholderText('Digite uma quantidade').slice(-1);
    fireEvent.change(newQty, { target: { value: '4' } });
    await userEvent.click(addButton);

    const row = screen.getByText('Madeira', { selector: 'span' }).closest('div')!;
    fireEvent.change(within(row).getByRole('textbox'), { target: { value: '5' } });

    await pick('Selecione um item', 'Cadeira');
    await userEvent.click(addButton);
    const chairRow = screen.getByText('Cadeira', { selector: 'span' }).closest('div')!;
    await userEvent.click(chairRow.querySelector('[data-icon="lucide:x"]')!.closest('button')!);

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('POST /api/inventory-items')[0].body).toEqual({
      name: 'Mesa',
      unit_id: '2',
      storage_id: 2,
      quantity: 2,
      category_ids: ['1'],
      components: [{ id: '10', quantity_required: 5 }],
    });
    expect(show).toHaveBeenCalledWith({ message: 'Item criado', color: 'green' });
  });

  it('sends null storage, ignores add without a selection, reports errors and resets', async () => {
    let response: unknown = fail('Falhou');
    const api = lookups({ 'POST /api/inventory-items': () => response });
    const { show, latest, onCancel } = renderLogic(useCreateInventoryItemLogicData, CreateInventoryItemLogicComponent);

    await userEvent.type(screen.getByLabelText(/^Nome/), 'Prego');
    await pick(/Unidade/, 'Quilograma');

    act(() => {
      // exercise the guard clauses of addComponent (no selection / unknown id)
      latest().setComponents(prev => prev);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Falhou', color: 'red' })));
    expect(api.calls('POST /api/inventory-items')[0].body).toMatchObject({ storage_id: null, quantity: 0, category_ids: [], components: [] });

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível criar o item. Tente novamente.' })));

    act(() => latest().setComponents([{ id: '10', name: 'Madeira', quantity_required: 1 }]));
    act(() => latest().createInventoryItemReset());
    expect(screen.getByLabelText(/^Nome/)).toHaveValue('');
    expect(screen.getByText('Nenhum componente adicionado.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('adds components when the API returns numeric ids (regression)', async () => {
    const numericWood = { ...itemWood, id: 10 as unknown as string };
    const api = lookups({
      'GET /api/inventory-items': page([numericWood]),
      'POST /api/inventory-items': ok({}, 'ok'),
    });
    const { onSuccess } = renderLogic(useCreateInventoryItemLogicData, CreateInventoryItemLogicComponent);

    await userEvent.type(screen.getByLabelText(/^Nome/), 'Mesa');
    await pick(/Unidade/, 'Unidade');
    await pick('Selecione um item', 'Madeira');
    await userEvent.click(document.querySelector('[data-icon="lucide:plus"]')!.closest('button')!);

    expect(screen.queryByText('Nenhum componente adicionado.')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('POST /api/inventory-items')[0].body.components).toEqual([{ id: '10', quantity_required: 1 }]);
  });

  it('tolerates empty lookup responses', async () => {
    mockFetch({
      'GET /api/units': ok(null),
      'GET /api/item-categories': ok(null),
      'GET /api/storages': ok(null),
      'GET /api/inventory-items': ok(null),
    });
    renderLogic(useCreateInventoryItemLogicData, CreateInventoryItemLogicComponent);

    await userEvent.click(screen.getByRole('combobox', { name: /Unidade/ }));

    expect(screen.queryByRole('option')).toBeNull();
  });
});

describe('UpdateInventoryItemName logic', () => {
  it('initializes from the item, validates and renames', async () => {
    let response: unknown = ok({}, 'Nome atualizado');
    const api = mockFetch({ 'PATCH /api/inventory-items/10': () => response });
    const { latest, onSuccess, show, onCancel, container } = renderLogic(useUpdateInventoryItemNameLogicData, UpdateInventoryItemNameLogicComponent, { editingItemId: '10' });

    act(() => latest().updateItemNameInit(itemWood));
    expect(screen.getByLabelText(/Nome/)).toHaveValue('Madeira');

    await userEvent.clear(screen.getByLabelText(/Nome/));
    submitBypassingNativeValidation(container);
    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Nome/), 'Pinus');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('PATCH /api/inventory-items/10')[0].body).toEqual({ name: 'Pinus' });
    expect(show).toHaveBeenCalledWith({ message: 'Nome atualizado', color: 'green' });

    response = fail('Erro nome');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Erro nome', color: 'red' })));

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível atualizar o nome. Tente novamente.' })));

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('UpdateInventoryItemStorage logic', () => {
  it('initializes, changes, clears and reports errors', async () => {
    let response: unknown = ok({}, 'Armazenamento atualizado');
    const api = mockFetch({
      'GET /api/storages': ok([storageA, storageB]),
      'PATCH /api/inventory-items/10': () => response,
    });
    const { latest, onSuccess, show, onCancel } = renderLogic(useUpdateInventoryItemStorageLogicData, UpdateInventoryItemStorageLogicComponent, { editingItemId: '10' });

    await waitFor(() => expect(latest().storages).toHaveLength(2));
    act(() => latest().updateItemStorageInit(itemWood));
    expect(screen.getByRole('combobox', { name: /Armazenamento/ })).toHaveValue('Depósito A');

    await pick(/Armazenamento/, 'Depósito B');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    act(() => latest().updateItemStorageInit(itemChair));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(2));

    act(() => latest().updateItemStorageInit(itemWood));
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Armazenamento/ })).toHaveValue('Depósito A'));
    const clear = screen.getByRole('combobox', { name: /Armazenamento/ }).parentElement!.querySelector('button')!;
    await userEvent.click(clear);
    expect(latest().updateItemStorageValidatedFormState.state.storage_id).toBe('');

    expect(api.calls('PATCH /api/inventory-items/10').map(c => c.body)).toEqual([{ storage_id: 2 }, { storage_id: null }]);
    expect(show).toHaveBeenCalledWith({ message: 'Armazenamento atualizado', color: 'green' });

    response = fail('Erro storage');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Erro storage', color: 'red' })));

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível atualizar o armazenamento. Tente novamente.' })));

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('handles an empty storages response', async () => {
    mockFetch({ 'GET /api/storages': ok(null) });
    const { latest } = renderLogic(useUpdateInventoryItemStorageLogicData, UpdateInventoryItemStorageLogicComponent, { editingItemId: '1' });

    await waitFor(() => expect(latest().storagesIsFetching).toBe(false));
    expect(latest().storages).toEqual([]);
  });
});

describe('UpdateQuantity logic', () => {
  it('computes set/add/subtract previews and submits the absolute quantity', async () => {
    const api = mockFetch({ 'PATCH /api/inventory-items/10': ok({}, 'Quantidade atualizada') });
    const { latest, onSuccess, show } = renderLogic(useUpdateQuantityLogicData, UpdateQuantityLogicComponent, { editingItemId: '10' }, { itemName: 'Madeira' });

    act(() => latest().updateQuantityInit(itemWood));
    expect(screen.getByText('Defina a nova quantidade para "Madeira".')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nova quantidade/)).toHaveValue('10');
    expect(screen.getByText('Nova quantidade: 10')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Somar'));
    expect(screen.getByLabelText(/^Valor/)).toHaveValue('0');
    await userEvent.clear(screen.getByLabelText(/^Valor/));
    await userEvent.type(screen.getByLabelText(/^Valor/), '5');
    expect(screen.getByText('Nova quantidade: 15')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Subtrair'));
    await userEvent.clear(screen.getByLabelText(/^Valor/));
    await userEvent.type(screen.getByLabelText(/^Valor/), '25');
    expect(screen.getByText('Nova quantidade: 0')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/^Valor/));
    await userEvent.type(screen.getByLabelText(/^Valor/), '4');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());

    await userEvent.click(screen.getByLabelText('Definir valor'));
    expect(screen.getByLabelText(/Nova quantidade/)).toHaveValue('10');

    expect(api.calls('PATCH /api/inventory-items/10')[0].body).toEqual({ quantity: 6 });
    expect(show).toHaveBeenCalledWith({ message: 'Quantidade atualizada', color: 'green' });
    expect(latest().currentQuantity).toBe(10);
    expect(latest().computeQuantity('add', 1)).toBe(11);
  });

  it('validates negative amounts and reports errors', async () => {
    let response: unknown = fail('Erro qtd');
    const api = mockFetch({ 'PATCH /api/inventory-items/10': () => response });
    const { latest, show, onCancel, container } = renderLogic(useUpdateQuantityLogicData, UpdateQuantityLogicComponent, { editingItemId: '10' }, { itemName: 'X' });

    act(() => latest().updateQuantityValidatedFormState.setValue('amount', -1));
    submitBypassingNativeValidation(container);
    expect(await screen.findByText('Quantidade não pode ser negativa')).toBeInTheDocument();
    expect(api.fn).not.toHaveBeenCalled();

    act(() => latest().updateQuantityValidatedFormState.setValue('amount', 1));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro qtd', color: 'red' })));

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível atualizar a quantidade.' })));

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('BuildInventoryItem logic', () => {
  it('explains when the item has no components', async () => {
    mockFetch({});
    const { onCancel } = renderLogic(useBuildInventoryItemLogicData, BuildInventoryItemLogicComponent, { editingItemId: '10' }, { item: itemWood });

    expect(screen.getByText(/Este item não possui componentes cadastrados/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows requirements per quantity, the max buildable and builds', async () => {
    let response: unknown = ok({}, '2 construídas');
    const api = mockFetch({ 'POST /api/inventory-items/11/build': () => response });
    const { latest, onSuccess, show, onCancel } = renderLogic(useBuildInventoryItemLogicData, BuildInventoryItemLogicComponent, { editingItemId: '11' }, { item: itemChair });

    expect(screen.getByText('Necessário: 3')).toBeInTheDocument();
    expect(screen.getByText('Disponível: 10')).toBeInTheDocument();
    expect(screen.getByText('Máx. possível: 3')).toBeInTheDocument();

    act(() => latest().buildValidatedFormState.setValue('quantity', 4));
    expect(screen.getByText('Necessário: 12')).toBeInTheDocument();

    act(() => latest().buildValidatedFormState.setValue('quantity', 2));
    await userEvent.click(screen.getByRole('button', { name: 'Construir' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('POST /api/inventory-items/11/build')[0].body).toEqual({ quantity: 2 });
    expect(show).toHaveBeenCalledWith({ message: '2 construídas', color: 'green' });

    response = fail('Estoque insuficiente');
    await userEvent.click(screen.getByRole('button', { name: 'Construir' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Estoque insuficiente', color: 'red' })));

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Construir' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível construir o item.' })));

    act(() => latest().buildReset());
    expect(screen.getByText('Necessário: 3')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('validates the minimum and disables building without stock', async () => {
    const api = mockFetch({});
    const noStock = { ...itemChair, components: [{ ...itemChair.components[0], current_quantity: '1.0000' }] };
    const { latest, container } = renderLogic(useBuildInventoryItemLogicData, BuildInventoryItemLogicComponent, { editingItemId: '11' }, { item: noStock });

    expect(screen.getByText('Máx. possível: 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Construir' })).toBeDisabled();

    act(() => latest().buildValidatedFormState.setValue('quantity', 0));
    submitBypassingNativeValidation(container);
    expect(await screen.findByText('Mínimo de 1 unidade')).toBeInTheDocument();
    expect(api.fn).not.toHaveBeenCalled();
  });
});
