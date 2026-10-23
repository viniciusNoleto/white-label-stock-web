import { describe, expect, it } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fail, mockFetch, ok } from '../../support/fetch';
import { renderLogic, submitBypassingNativeValidation } from '../../support/logic';
import { useCreateStorageLogicData, CreateStorageLogicComponent } from '@/resources/storage/logics/CreateStorage';
import { useUpdateStorageLogicData, UpdateStorageLogicComponent } from '@/resources/storage/logics/UpdateStorage';
import { useDeleteStorageLogicData, DeleteStorageLogicComponent } from '@/resources/storage/logics/DeleteStorage';

const nullMessage = { success: false, message: null, data: null };

describe('CreateStorage logic', () => {
  it('validates and creates with an optional description', async () => {
    const api = mockFetch({ 'POST /api/storages': ok({}, 'Criado') });
    const { container, onSuccess, show } = renderLogic(useCreateStorageLogicData, CreateStorageLogicComponent);

    submitBypassingNativeValidation(container);
    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Nome/), 'Galpão');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    await userEvent.type(screen.getByLabelText(/Descrição/), 'Fundos');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(2));

    expect(api.calls('POST /api/storages').map(c => c.body)).toEqual([
      { name: 'Galpão' },
      { name: 'Galpão', description: 'Fundos' },
    ]);
    expect(show).toHaveBeenCalledWith({ message: 'Criado', color: 'green' });
  });

  it('reports errors, resets and cancels', async () => {
    let response: unknown = fail('Duplicado');
    mockFetch({ 'POST /api/storages': () => response });
    const { show, latest, onCancel } = renderLogic(useCreateStorageLogicData, CreateStorageLogicComponent);

    await userEvent.type(screen.getByLabelText(/Nome/), 'X');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicado', color: 'red' })));

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível criar o armazenamento. Tente novamente.' })));

    act(() => latest().createStorageReset());
    expect(screen.getByLabelText(/Nome/)).toHaveValue('');

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('UpdateStorage logic', () => {
  it('updates and maps an empty description to undefined', async () => {
    const api = mockFetch({ 'PUT /api/storages/2': ok({}, 'Atualizado') });
    const { latest, onSuccess, show } = renderLogic(useUpdateStorageLogicData, UpdateStorageLogicComponent, { editingStorageId: '2' });

    act(() => latest().updateStorageValidatedFormState.setState({ name: 'A', description: 'B' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    await userEvent.clear(screen.getByLabelText(/Descrição/));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(2));

    expect(api.calls('PUT /api/storages/2').map(c => c.body)).toEqual([{ name: 'A', description: 'B' }, { name: 'A' }]);
    expect(show).toHaveBeenCalledWith({ message: 'Atualizado', color: 'green' });
  });

  it('validates and reports errors', async () => {
    let response: unknown = fail('Erro Y');
    const api = mockFetch({ 'PUT /api/storages/2': () => response });
    const { latest, show, onCancel, container } = renderLogic(useUpdateStorageLogicData, UpdateStorageLogicComponent, { editingStorageId: '2' });

    submitBypassingNativeValidation(container);
    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(api.fn).not.toHaveBeenCalled();

    act(() => latest().updateStorageValidatedFormState.setState({ name: 'A', description: '' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro Y' })));

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível atualizar o armazenamento. Tente novamente.' })));

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('DeleteStorage logic', () => {
  it('confirms deletion and handles errors', async () => {
    let response: unknown = ok(null, 'Excluído');
    const api = mockFetch({ 'DELETE /api/storages/6': () => response });
    const { onSuccess, show, onCancel } = renderLogic(
      useDeleteStorageLogicData,
      DeleteStorageLogicComponent,
      { editingStorageId: '6' },
      { storageName: 'Galpão' },
    );

    expect(screen.getByText('Tem certeza que deseja excluir o armazenamento "Galpão"? Esta ação não pode ser desfeita.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('DELETE /api/storages/6')).toHaveLength(1);
    expect(show).toHaveBeenCalledWith({ message: 'Excluído', color: 'green' });

    response = fail('Em uso');
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Em uso', color: 'red' })));

    response = nullMessage;
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível excluir o armazenamento. Tente novamente.' })));

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
