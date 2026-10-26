import { isSignal, type Signal, signal, untracked, type WritableSignal } from '@angular/core';
import { type FieldTree, form, validateStandardSchema } from '@angular/forms/signals';
import { type AnyObject, type ObjectSchema, ValidationError } from 'yup';

type StandardIssue = { message: string; path?: ReadonlyArray<PropertyKey> };

type SyncStandardSchema<T> = {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) => { value: T } | { issues: StandardIssue[] };
  };
};

/** `'components[0].quantity'` → `['components', 0, 'quantity']` */
function toPath(path: string | undefined): PropertyKey[] {
  if (!path) return [];

  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? Number(part) : part.replace(/^"|"$/g, '')));
}

/**
 * O Standard Schema nativo do Yup é sempre assíncrono, o que deixaria o form
 * em `pending` a cada tecla. Como os schemas do projeto não têm testes
 * assíncronos, este adaptador usa `validateSync` — os erros aparecem e o
 * `valid()` responde na hora, como no `useValidatedFormState` do React.
 */
export function toSyncStandardSchema<T extends AnyObject>(schema: ObjectSchema<T>): SyncStandardSchema<T> {
  return {
    '~standard': {
      version: 1,
      vendor: 'yup',
      validate(value: unknown) {
        try {
          return { value: schema.validateSync(value, { abortEarly: false }) as T };
        } catch (error) {
          if (!ValidationError.isError(error)) throw error;

          const errors = error.inner.length ? error.inner : [error];

          return {
            issues: errors.map((inner) => ({ message: inner.errors[0] ?? inner.message, path: toPath(inner.path) })),
          };
        }
      },
    },
  };
}

export type ValidatedFormState<T extends AnyObject> = {
  /** Estado do formulário — é o que vai para o service. */
  state: WritableSignal<T>;
  /** Árvore de campos do Signal Forms: `[formField]="…field.name"` nos inputs. */
  field: FieldTree<T>;
  setState: (value: T) => void;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Volta para o default do schema (ou para `value`) e limpa touched/erros. */
  reset: (value?: T) => void;
  /** Marca todos os campos como tocados (exibe os erros) e diz se o form é válido. */
  validate: () => boolean;
};

/**
 * Equivalente ao `useValidatedFormState` do React: schema Yup + estado + erros,
 * agora sobre Signal Forms (`@angular/forms/signals`).
 *
 * Aceita o schema direto ou um `Signal`/`computed` do schema — use a forma
 * reativa quando as mensagens vêm do `i18n.t()`, para que mudem com o idioma.
 *
 * Precisa de contexto de injeção (o `form()` do Signal Forms exige).
 */
export function validatedFormState<T extends AnyObject>(schema: ObjectSchema<T> | Signal<ObjectSchema<T>>): ValidatedFormState<T> {
  const currentSchema = isSignal(schema) ? schema : () => schema;

  const getDefault = () => untracked(currentSchema).getDefault() as T;

  const state = signal<T>(getDefault());

  const field = form(state, (path) => {
    validateStandardSchema(path as never, () => toSyncStandardSchema(currentSchema()) as never);
  });

  return {
    state,
    field,
    setState: (value) => state.set(value),
    setValue: (key, value) => state.update((current) => ({ ...current, [key]: value })),
    reset: (value) => {
      state.set(value ?? getDefault());
      field().reset();
    },
    validate: () => {
      field().markAsTouched();
      return field().valid();
    },
  };
}
