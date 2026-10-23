import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderWithProviders } from '../../support/render';
import { FormTextInput } from '@/components/form/TextInput';
import { FormPassword } from '@/components/form/Password';
import { FormTextarea } from '@/components/form/Textarea';
import { FormNumberInput } from '@/components/form/Number';
import { FormSwitch } from '@/components/form/Switch';
import { FormDatePicker } from '@/components/form/DatePicker';
import { FormDateTimePicker } from '@/components/form/DateTimePicker';
import { FormButton } from '@/components/form/Button';

function Controlled<T>({ initial, render }: { initial: T; render: (p: { value: T; onChange: (v: T) => void }) => React.ReactNode }) {
  const [value, setValue] = useState(initial);
  return <>{render({ value, onChange: setValue })}</>;
}

describe('text-like inputs', () => {
  it.each([
    ['FormTextInput', FormTextInput],
    ['FormPassword', FormPassword],
    ['FormTextarea', FormTextarea],
  ] as const)('%s passes the extracted value to onChange and validates on change/blur', async (_, Component) => {
    const onChange = vi.fn();
    const onValidate = vi.fn();

    renderWithProviders(
      <Controlled
        initial=""
        render={({ value, onChange: set }) => (
          <Component
            label="Campo"
            value={value}
            onChange={(v: string) => { onChange(v); set(v); }}
            onValidate={onValidate}
          />
        )}
      />,
    );

    await userEvent.type(screen.getByLabelText('Campo'), 'ab');
    expect(onChange).toHaveBeenLastCalledWith('ab');
    expect(onValidate).toHaveBeenCalledTimes(2);

    fireEvent.blur(screen.getByLabelText('Campo'));
    expect(onValidate).toHaveBeenCalledTimes(3);
  });

  it('FormTextInput trims when requested', async () => {
    const onChange = vi.fn();
    renderWithProviders(<FormTextInput label="Campo" trim onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Campo'), { target: { value: '  x  ' } });

    expect(onChange).toHaveBeenCalledWith('x');
  });

  it('works without handlers', () => {
    renderWithProviders(<FormTextInput label="Campo" />);

    expect(() => fireEvent.change(screen.getByLabelText('Campo'), { target: { value: 'x' } })).not.toThrow();
  });

  it.each([['FormPassword', FormPassword], ['FormTextarea', FormTextarea]] as const)('%s works without handlers', (_, Component) => {
    renderWithProviders(<Component label="Campo" />);

    expect(() => fireEvent.change(screen.getByLabelText('Campo'), { target: { value: 'x' } })).not.toThrow();
  });
});

describe('FormNumberInput', () => {
  it('emits numeric values', async () => {
    const onChange = vi.fn();
    const onValidate = vi.fn();

    renderWithProviders(
      <Controlled
        initial={0 as number | string}
        render={({ value, onChange: set }) => (
          <FormNumberInput
            label="Qtd"
            value={value}
            onChange={(v) => { onChange(v); set(v); }}
            onValidate={onValidate}
          />
        )}
      />,
    );

    const input = screen.getByLabelText('Qtd');
    await userEvent.clear(input);
    await userEvent.type(input, '12');
    fireEvent.blur(input);

    expect(onChange).toHaveBeenLastCalledWith(12);
    expect(onValidate).toHaveBeenCalled();
  });

  it('works without onChange', () => {
    renderWithProviders(<FormNumberInput label="Qtd" />);

    expect(() => fireEvent.change(screen.getByLabelText('Qtd'), { target: { value: '3' } })).not.toThrow();
  });
});

describe('FormSwitch', () => {
  it('emits the checked boolean', async () => {
    const onChange = vi.fn();
    const onValidate = vi.fn();

    renderWithProviders(
      <Controlled
        initial={false}
        render={({ value, onChange: set }) => (
          <FormSwitch
            label="Ativo"
            value={value}
            onChange={(v) => { onChange(v); set(v); }}
            onValidate={onValidate}
          />
        )}
      />,
    );

    await userEvent.click(screen.getByLabelText('Ativo'));

    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText('Ativo')).toBeChecked();
    expect(onValidate).toHaveBeenCalled();
  });

  it('works without onChange', () => {
    renderWithProviders(<FormSwitch label="Ativo" />);

    expect(() => fireEvent.click(screen.getByLabelText('Ativo'))).not.toThrow();
  });
});

describe('date inputs', () => {
  it('FormDatePicker renders a native date input', () => {
    const onChange = vi.fn();
    renderWithProviders(<FormDatePicker label="Data" value="2026-01-02" onChange={onChange} />);
    const input = screen.getByLabelText('Data');

    expect(input).toHaveAttribute('type', 'date');
    fireEvent.change(input, { target: { value: '2026-02-03' } });
    expect(onChange).toHaveBeenCalledWith('2026-02-03');
  });

  it('FormDateTimePicker strips milliseconds and handles empty values', () => {
    const { rerender } = renderWithProviders(<FormDateTimePicker label="Quando" value="2026-01-02T10:20:30.000Z" />);
    const input = screen.getByLabelText('Quando');

    expect(input).toHaveAttribute('type', 'datetime-local');
    expect((input as HTMLInputElement).value).toMatch(/^2026-01-02T10:20:30(\.000)?$/);

    rerender(<FormDateTimePicker label="Quando" />);
    expect(screen.getByLabelText('Quando')).toHaveValue('');
  });
});

describe('FormButton', () => {
  it('renders children with priority over label', () => {
    renderWithProviders(<FormButton label="label">filho</FormButton>);

    expect(screen.getByRole('button')).toHaveTextContent('filho');
  });

  it('renders the label prop and side icons', () => {
    renderWithProviders(<FormButton label="Novo" leftIcon="lucide:plus" rightIcon="lucide:arrow-right" />);
    const button = screen.getByRole('button', { name: 'Novo' });

    expect(button.querySelector('[data-icon="lucide:plus"]')).not.toBeNull();
    expect(button.querySelector('[data-icon="lucide:arrow-right"]')).not.toBeNull();
  });

  it('renders custom left/right sections when no icon strings are given', () => {
    renderWithProviders(<FormButton leftSection={<i>L</i>} rightSection={<i>R</i>}>x</FormButton>);

    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('renders an icon-only button and fires onClick', async () => {
    const onClick = vi.fn();
    renderWithProviders(<FormButton icon="lucide:trash-2" aria-label="excluir" onClick={onClick} />);

    await userEvent.click(screen.getByRole('button', { name: 'excluir' }));

    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('button').querySelector('[data-icon="lucide:trash-2"]')).not.toBeNull();
  });

  it('renders nothing inside when no content is provided', () => {
    renderWithProviders(<FormButton aria-label="vazio" />);

    expect(screen.getByRole('button', { name: 'vazio' })).toHaveTextContent('');
  });

  it('wraps in a tooltip when provided', async () => {
    renderWithProviders(<FormButton tooltip="Dica">x</FormButton>);

    await userEvent.hover(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('Dica')).toBeInTheDocument());
  });
});
