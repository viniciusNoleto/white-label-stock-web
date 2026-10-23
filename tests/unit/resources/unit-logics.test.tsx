import { describe, expect, it } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fail, mockFetch, ok } from '../../support/fetch';
import { renderLogic, submitBypassingNativeValidation } from '../../support/logic';
import { useCreateUnitLogicData, CreateUnitLogicComponent } from '@/resources/unit/logics/CreateUnit';
import { useUpdateUnitLogicData, UpdateUnitLogicComponent } from '@/resources/unit/logics/UpdateUnit';
import { useDeleteUnitLogicData, DeleteUnitLogicComponent } from '@/resources/unit/logics/DeleteUnit';

describe('CreateUnit logic', () => {
  it('validates required fields before calling the API', async () => {
    const api = mockFetch({});
    const { container } = renderLogic(useCreateUnitLogicData, CreateUnitLogicComponent);

    submitBypassingNativeValidation(container);

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Abreviação é obrigatória')).toBeInTheDocument();
    expect(api.fn).not.toHaveBeenCalled();
  });

  it('creates the unit and notifies with the localized API message', async () => {
    const api = mockFetch({ 'POST /api/units': ok({ id: '1' }, 'Unidade criada') });
    const { onSuccess, show } = renderLogic(useCreateUnitLogicData, CreateUnitLogicComponent);

    await userEvent.type(screen.getByLabelText(/Nome/), 'Litro');
    await userEvent.type(screen.getByLabelText(/Abreviação/), 'L');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('POST /api/units')[0].body).toEqual({ name: 'Litro', abbreviation: 'L' });
    expect(show).toHaveBeenCalledWith({ message: 'Unidade criada', color: 'green' });
  });

  it('shows the API error message, or the fallback when absent', async () => {
    let response: unknown = fail('Duplicada');
    mockFetch({ 'POST /api/units': () => response });
    const { show, onSuccess, latest } = renderLogic(useCreateUnitLogicData, CreateUnitLogicComponent);

    await userEvent.type(screen.getByLabelText(/Nome/), 'Litro');
    await userEvent.type(screen.getByLabelText(/Abreviação/), 'L');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith({ title: 'Erro', message: 'Duplicada', color: 'red' }));

    response = { success: false, message: null, data: null };
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith({
      title: 'Erro',
      message: 'Não foi possível criar a unidade. Tente novamente.',
      color: 'red',
    }));
    expect(onSuccess).not.toHaveBeenCalled();

    act(() => latest().createUnitReset());
    expect(screen.getByLabelText(/Nome/)).toHaveValue('');
  });

  it('cancels', async () => {
    const { onCancel } = renderLogic(useCreateUnitLogicData, CreateUnitLogicComponent);

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalled();
  });
});

describe('UpdateUnit logic', () => {
  it('submits the pre-filled state to the editing id', async () => {
    const api = mockFetch({ 'PUT /api/units/5': ok({}, 'Atualizada') });
    const { latest, onSuccess, show } = renderLogic(useUpdateUnitLogicData, UpdateUnitLogicComponent, { editingUnitId: '5' });

    act(() => latest().updateUnitValidatedFormState.setState({ name: 'Grama', abbreviation: 'g' }));
    await userEvent.clear(screen.getByLabelText(/Abreviação/));
    await userEvent.type(screen.getByLabelText(/Abreviação/), 'gr');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('PUT /api/units/5')[0].body).toEqual({ name: 'Grama', abbreviation: 'gr' });
    expect(show).toHaveBeenCalledWith({ message: 'Atualizada', color: 'green' });
  });

  it('blocks invalid submissions and reports API errors with fallback', async () => {
    const api = mockFetch({ 'PUT /api/units/5': { success: false, message: null, data: null } });
    const { latest, show, onCancel, container } = renderLogic(useUpdateUnitLogicData, UpdateUnitLogicComponent, { editingUnitId: '5' });

    submitBypassingNativeValidation(container);
    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(api.fn).not.toHaveBeenCalled();

    act(() => latest().updateUnitValidatedFormState.setState({ name: 'a', abbreviation: 'b' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível atualizar a unidade. Tente novamente.' })));

    act(() => latest().updateUnitValidatedFormState.setState({ name: 'a', abbreviation: 'b' }));
    api.fn.mockResolvedValueOnce(new Response(JSON.stringify(fail('Conflito'))));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Conflito', color: 'red' })));

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('DeleteUnit logic', () => {
  it('confirms deletion', async () => {
    const api = mockFetch({ 'DELETE /api/units/9': ok(null, 'Excluída') });
    const { onSuccess, show } = renderLogic(useDeleteUnitLogicData, DeleteUnitLogicComponent, { editingUnitId: '9' }, { unitName: 'Metro' });

    expect(screen.getByText('Tem certeza que deseja excluir a unidade "Metro"? Esta ação não pode ser desfeita.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls('DELETE /api/units/9')).toHaveLength(1);
    expect(show).toHaveBeenCalledWith({ message: 'Excluída', color: 'green' });
  });

  it('reports errors and cancels', async () => {
    let response: unknown = fail('Em uso');
    mockFetch({ 'DELETE /api/units/9': () => response });
    const { show, onCancel } = renderLogic(useDeleteUnitLogicData, DeleteUnitLogicComponent, { editingUnitId: '9' }, { unitName: 'Metro' });

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Em uso', color: 'red' })));

    response = { success: false, message: null, data: null };
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Não foi possível excluir a unidade. Tente novamente.' })));

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
