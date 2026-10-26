import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import * as yup from 'yup';
import { toSyncStandardSchema, validatedFormState } from './form';

const schema = yup.object({
  name: yup.string().default('').required('Nome é obrigatório'),
  amount: yup.number().nullable().default(1).min(1, 'Mínimo 1'),
  items: yup.array(yup.object({ qty: yup.number().required().min(1, 'qty') })).default([]),
});

describe('toSyncStandardSchema', () => {
  it('validates synchronously and maps nested paths', () => {
    const result = toSyncStandardSchema(schema)['~standard'].validate({ name: '', amount: 0, items: [{ qty: 0 }] });

    expect('issues' in result && result.issues).toEqual([
      { message: 'Nome é obrigatório', path: ['name'] },
      { message: 'Mínimo 1', path: ['amount'] },
      { message: 'qty', path: ['items', 0, 'qty'] },
    ]);
  });

  it('returns the value when valid', () => {
    expect(toSyncStandardSchema(schema)['~standard'].validate({ name: 'a', amount: 2, items: [] })).toEqual({ value: { name: 'a', amount: 2, items: [] } });
  });
});

describe('validatedFormState', () => {
  function create<T extends yup.AnyObject>(input: yup.ObjectSchema<T> | ReturnType<typeof computed<yup.ObjectSchema<T>>>) {
    return TestBed.runInInjectionContext(() => validatedFormState(input));
  }

  it('starts from the schema defaults, untouched and without visible errors', () => {
    const form = create(schema);

    expect(form.state()).toEqual({ name: '', amount: 1, items: [] });
    expect(form.field.name().touched()).toBe(false);
    expect(form.field.name().invalid()).toBe(true);
  });

  it('validate() touches every field and reports validity', () => {
    const form = create(schema);

    expect(form.validate()).toBe(false);
    expect(form.field.name().touched()).toBe(true);
    expect(form.field.name().errors()[0].message).toBe('Nome é obrigatório');

    form.setValue('name', 'Litro');

    expect(form.validate()).toBe(true);
    expect(form.field.name().errors()).toEqual([]);
  });

  it('reset() restores defaults (or the given value) and clears touched', () => {
    const form = create(schema);
    form.setValue('name', 'x');
    form.validate();

    form.reset();
    expect(form.state().name).toBe('');
    expect(form.field.name().touched()).toBe(false);

    form.reset({ name: 'Kg', amount: 3, items: [] });
    expect(form.state()).toEqual({ name: 'Kg', amount: 3, items: [] });
  });

  it('follows a reactive schema (e.g. translated messages)', () => {
    const message = signal('obrigatório');
    const form = create(computed(() => yup.object({ name: yup.string().default('').required(message()) })));

    form.validate();
    expect(form.field.name().errors()[0].message).toBe('obrigatório');

    message.set('required');
    expect(form.field.name().errors()[0].message).toBe('required');
  });
});
