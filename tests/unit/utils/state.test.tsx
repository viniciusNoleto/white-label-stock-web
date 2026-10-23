import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import * as yup from 'yup';
import {
  setStateByProduce,
  useBooleanRecordState,
  useImmediateState,
  useRecordState,
  useTrimmedStringState,
  useValidatedFormState,
} from '@/utils/state';

describe('useTrimmedStringState', () => {
  it('trims on set and normalizes empty values', () => {
    const { result } = renderHook(() => useTrimmedStringState('init'));

    act(() => result.current[1]('  hello  '));
    expect(result.current[0]).toBe('hello');

    act(() => result.current[1](''));
    expect(result.current[0]).toBe('');
  });
});

describe('useImmediateState', () => {
  it('updates synchronously', () => {
    const { result } = renderHook(() => useImmediateState(1));

    act(() => result.current[1](5));

    expect(result.current[0]).toBe(5);
  });
});

describe('useRecordState / useBooleanRecordState', () => {
  it('exposes field bindings for deep paths', () => {
    const { result } = renderHook(() => useRecordState({ search: '', nested: { page: 1 } }));

    expect(result.current.field('nested.page').value).toBe(1);

    act(() => result.current.field('search').onChange('abc'));
    act(() => result.current.setValue('nested.page', 2));

    expect(result.current.state).toEqual({ search: 'abc', nested: { page: 2 } });
  });

  it('works for boolean records', () => {
    const { result } = renderHook(() => useBooleanRecordState<'a' | 'b'>({ a: false, b: undefined }));

    act(() => result.current.setValue('b', true));

    expect(result.current.state).toEqual({ a: false, b: true });
  });
});

describe('setStateByProduce', () => {
  it('applies an immer producer', () => {
    const setState = vi.fn();

    setStateByProduce(setState, (draft: { n: number }) => { draft.n += 1; });
    const updater = setState.mock.calls[0][0];

    expect(updater({ n: 1 })).toEqual({ n: 2 });
  });
});

describe('useValidatedFormState', () => {
  const schema = yup.object({
    name: yup.string().default('').required('Nome obrigatório'),
    age: yup.number().default(0).min(18, 'Maior de idade'),
  });

  it('starts from schema defaults', () => {
    const { result } = renderHook(() => useValidatedFormState(schema));

    expect(result.current.state).toEqual({ name: '', age: 0 });
    expect(result.current.field('name')).toMatchObject({ value: '', error: undefined });
  });

  it('validate() collects every error and returns false', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useValidatedFormState(schema));

    let valid = true;
    await act(async () => { valid = await result.current.validate(); });

    expect(valid).toBe(false);
    expect(result.current.errors).toEqual({ name: 'Nome obrigatório', age: 'Maior de idade' });
    expect(result.current.field('age').error).toBe('Maior de idade');
  });

  it('validate() returns true for a valid state', async () => {
    const { result } = renderHook(() => useValidatedFormState(schema));

    act(() => result.current.field('name').onChange('Ana'));
    act(() => result.current.setValue('age', 30));

    let valid = false;
    await act(async () => { valid = await result.current.validate(); });

    expect(valid).toBe(true);
  });

  it('onValidate validates a single field and clears it when fixed', async () => {
    const { result } = renderHook(() => useValidatedFormState(schema));

    await act(async () => { result.current.field('name').onValidate(); });
    expect(result.current.field('name').error).toBe('Nome obrigatório');
    expect(result.current.field('age').error).toBeUndefined();

    act(() => result.current.field('name').onChange('Ana'));
    await act(async () => { result.current.field('name').onValidate(); });
    expect(result.current.field('name').error).toBeUndefined();
  });

  it('ignores non-string error entries', () => {
    const { result } = renderHook(() => useValidatedFormState(schema));

    act(() => result.current.setErrors({ name: { nested: 'x' } }));

    expect(result.current.field('name').error).toBeUndefined();
  });

  it('setErrorValue sets an error imperatively', () => {
    const { result } = renderHook(() => useValidatedFormState(schema));

    act(() => result.current.setErrorValue('name', 'Erro manual'));

    expect(result.current.field('name').error).toBe('Erro manual');
  });
});
