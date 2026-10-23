import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderWithProviders } from '../../support/render';
import { FormSelect } from '@/components/form/Select';
import { FormMultiSelect } from '@/components/form/MultiSelect';
import { FormAutocomplete } from '@/components/form/Autocomplete';

const people = [{ id: '1', profile: { name: 'Ana' } }, { id: '2', profile: { name: 'Bruno' } }];

describe('FormSelect', () => {
  function Harness({ onChange, onValidate, disabled }: { onChange?: (v: string | null) => void; onValidate?: () => void; disabled?: boolean }) {
    const [value, setValue] = useState<string | null>(null);
    return (
      <FormSelect
        label="Pessoa"
        data={people}
        valueField="id"
        labelField="profile.name"
        value={value}
        disabled={disabled}
        onChange={(v) => { onChange?.(v); setValue(v); }}
        onValidate={onValidate}
      />
    );
  }

  it('maps objects via value/label fields and emits the selected value', async () => {
    const onChange = vi.fn();
    const onValidate = vi.fn();
    renderWithProviders(<Harness onChange={onChange} onValidate={onValidate} />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Pessoa' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Bruno' }));

    expect(onChange).toHaveBeenCalledWith('2');
    expect(screen.getByRole('combobox', { name: 'Pessoa' })).toHaveValue('Bruno');
    expect(onValidate).toHaveBeenCalled();

    fireEvent.blur(screen.getByRole('combobox', { name: 'Pessoa' }));
    expect(onValidate).toHaveBeenCalledTimes(2);
  });

  it('accepts raw Mantine data', async () => {
    renderWithProviders(<FormSelect label="Status" data={['Ativo', 'Inativo']} />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }));

    expect(await screen.findByRole('option', { name: 'Inativo' })).toBeInTheDocument();
  });

  it('handles non-array data and missing onChange', async () => {
    renderWithProviders(<FormSelect label="Nada" data={undefined} />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Nada' }));

    expect(screen.queryByRole('option')).toBeNull();
  });

  it('renders as disabled', () => {
    renderWithProviders(<Harness disabled />);

    expect(screen.getByRole('combobox', { name: 'Pessoa' })).toBeDisabled();
  });

  it('selects without an onChange handler', async () => {
    renderWithProviders(<FormSelect label="Status" data={['Ativo']} />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Ativo' }));

    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument();
  });
});

describe('FormMultiSelect', () => {
  it('maps objects and emits arrays', async () => {
    const onChange = vi.fn();
    const onValidate = vi.fn();

    function Harness() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <FormMultiSelect
          label="Pessoas"
          data={people}
          valueField="id"
          labelField={(p: typeof people[number]) => p.profile.name}
          value={value}
          onChange={(v) => { onChange(v); setValue(v); }}
          onValidate={onValidate}
        />
      );
    }

    renderWithProviders(<Harness />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Pessoas' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Ana' }));

    expect(onChange).toHaveBeenLastCalledWith(['1']);
    expect(onValidate).toHaveBeenCalled();

    fireEvent.blur(screen.getByRole('combobox', { name: 'Pessoas' }));
    expect(onValidate).toHaveBeenCalledTimes(2);
  });

  it('accepts raw data, non-array data and no handlers', async () => {
    const { rerender } = renderWithProviders(<FormMultiSelect label="Tags" data={['a', 'b']} />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Tags' }));
    await userEvent.click(await screen.findByRole('option', { name: 'a' }));

    rerender(<FormMultiSelect label="Tags" data={undefined} disabled value={['a']} />);
    expect(screen.queryByRole('option', { name: 'b' })).toBeNull();
  });
});

describe('FormAutocomplete', () => {
  it('debounces onComplete, selects by value and shows the label', async () => {
    const onComplete = vi.fn();
    const onChange = vi.fn();
    const onValidate = vi.fn();

    function Harness() {
      const [value, setValue] = useState('');
      return (
        <FormAutocomplete
          label="Aluno"
          data={people}
          valueField="id"
          labelField="profile.name"
          value={value}
          onComplete={onComplete}
          onChange={(v) => { onChange(v); setValue(v); }}
          onValidate={onValidate}
        />
      );
    }

    renderWithProviders(<Harness />);
    const input = screen.getByLabelText('Aluno');

    await userEvent.type(input, 'Br');
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith('Br'), { timeout: 1500 });
    expect(onComplete).toHaveBeenCalledTimes(1);

    await userEvent.click(await screen.findByRole('option', { name: 'Bruno' }));

    expect(onChange).toHaveBeenCalledWith('2');
    expect(input).toHaveValue('Bruno');
    expect(onValidate).toHaveBeenCalled();

    act(() => { fireEvent.focus(input); fireEvent.blur(input); });
    expect(onValidate.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('supports plain string data, the limit and an empty dropdown', async () => {
    const { rerender } = renderWithProviders(<FormAutocomplete label="Cidade" data={['Recife', 'Natal', 'Belém']} limit={2} />);

    await userEvent.click(screen.getByLabelText('Cidade'));
    expect(await screen.findAllByRole('option')).toHaveLength(2);

    rerender(<FormAutocomplete label="Cidade" />);
    await userEvent.type(screen.getByLabelText('Cidade'), 'x');
    expect(screen.queryByRole('option')).toBeNull();
  });
});
