import { describe, expect, it } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fail, mockFetch, ok } from '../../support/fetch';
import { renderLogic, submitBypassingNativeValidation } from '../../support/logic';
import { useCreateItemCategoryLogicData, CreateItemCategoryLogicComponent } from '@/resources/item-category/logics/CreateItemCategory';
import { useUpdateItemCategoryLogicData, UpdateItemCategoryLogicComponent } from '@/resources/item-category/logics/UpdateItemCategory';
import { useDeleteItemCategoryLogicData, DeleteItemCategoryLogicComponent } from '@/resources/item-category/logics/DeleteItemCategory';

const nullMessage = { success: false, message: null, data: null };

describe('CreateItemCategory logic', () => {
  it('defaults the color, validates and creates', async () => {
    const api = mockFetch({ 'POST /api/item-categories': ok({}, 'Criada') });
    const { container, onSuccess, show } = renderLogic(useCreateItemCategoryLogicData, CreateItemCategoryLogicComponent);

    expect(screen.getByLabelText(/Cor/)).toHaveValue('#6F1FF9');

    submitBypassingNativeValidation(container);
    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(api.fn).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(/Nome/), 'Ferragens');
    fireEvent.change(screen.getByLabelText(/Cor/), { target: { value: '#2ecc71' } });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('POST /api/item-categories')[0].body).toEqual({ name: 'Ferragens', color_hex: '#2ecc71' });
    expect(show).toHaveBeenCalledWith({ message: 'Criada', color: 'green' });
  });

  it('shows the color validation error', async () => {
    mockFetch({});
    const { container } = renderLogic(useCreateItemCategoryLogicData, CreateItemCategoryLogicComponent);

    fireEvent.change(screen.getByLabelText(/Cor/), { target: { value: '' } });
    submitBypassingNativeValidation(container);

    expect(await screen.findByText('Cor é obrigatória')).toBeInTheDocument();
  });

  it('reports errors, resets and cancels', async () => {
    let response: unknown = fail('Duplicada');
    mockFetch({ 'POST /api/item-categories': () => response });
    const { show, latest, onCancel } = renderLogic(useCreateItemCategoryLogicData, CreateItemCategoryLogicComponent);

    await userEvent.type(screen.getByLabelText(/Nome/), 'X');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicada', color: 'red' })));

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível criar a categoria. Tente novamente.' })));

    act(() => latest().createItemCategoryReset());
    expect(screen.getByLabelText(/Nome/)).toHaveValue('');

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('UpdateItemCategory logic', () => {
  it('updates the editing category', async () => {
    const api = mockFetch({ 'PUT /api/item-categories/3': ok({}, 'Atualizada') });
    const { latest, onSuccess, show } = renderLogic(useUpdateItemCategoryLogicData, UpdateItemCategoryLogicComponent, { editingCategoryId: '3' });

    act(() => latest().updateItemCategoryValidatedFormState.setState({ name: 'Antiga', color_hex: '#000000' }));
    expect(screen.getByLabelText(/Nome/)).toHaveValue('Antiga');

    fireEvent.change(screen.getByLabelText(/Cor/), { target: { value: '#ffffff' } });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('PUT /api/item-categories/3')[0].body).toEqual({ name: 'Antiga', color_hex: '#ffffff' });
    expect(show).toHaveBeenCalledWith({ message: 'Atualizada', color: 'green' });
  });

  it('validates and reports errors', async () => {
    let response: unknown = fail('Erro X');
    const api = mockFetch({ 'PUT /api/item-categories/3': () => response });
    const { latest, show, onCancel, container } = renderLogic(useUpdateItemCategoryLogicData, UpdateItemCategoryLogicComponent, { editingCategoryId: '3' });

    submitBypassingNativeValidation(container);
    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(api.fn).not.toHaveBeenCalled();

    act(() => latest().updateItemCategoryValidatedFormState.setState({ name: 'A', color_hex: '#000000' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro X' })));

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível atualizar a categoria. Tente novamente.' })));

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('DeleteItemCategory logic', () => {
  it('confirms deletion and handles errors', async () => {
    let response: unknown = ok(null, 'Excluída');
    const api = mockFetch({ 'DELETE /api/item-categories/4': () => response });
    const { onSuccess, show, onCancel } = renderLogic(
      useDeleteItemCategoryLogicData,
      DeleteItemCategoryLogicComponent,
      { editingCategoryId: '4' },
      { categoryName: 'Ferragens' },
    );

    expect(screen.getByText('Tem certeza que deseja excluir a categoria "Ferragens"? Esta ação não pode ser desfeita.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Excluir categoria' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('DELETE /api/item-categories/4')).toHaveLength(1);
    expect(show).toHaveBeenCalledWith({ message: 'Excluída', color: 'green' });

    response = fail('Em uso');
    await userEvent.click(screen.getByRole('button', { name: 'Excluir categoria' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Em uso', color: 'red' })));

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Excluir categoria' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível excluir a categoria. Tente novamente.' })));

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
