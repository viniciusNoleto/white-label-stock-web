import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  inject,
  Injector,
  PLATFORM_ID,
  runInInjectionContext,
  type Signal,
  signal,
  untracked,
} from '@angular/core';
import type { Observable, Subscription } from 'rxjs';

export type QueryRef<T> = {
  data: Signal<T | undefined>;
  error: Signal<unknown>;
  /** `true` enquanto uma busca está em andamento (inclusive refetch). */
  isFetching: Signal<boolean>;
  /** Dispara a busca de novo. Uma busca anterior ainda em andamento é cancelada. */
  refetch: () => void;
};

export type MutationRef<TData, TVariables> = {
  mutate: (variables: TVariables) => void;
  isPending: Signal<boolean>;
  data: Signal<TData | undefined>;
  error: Signal<unknown>;
};

/**
 * Equivalente ao `useQuery` (TanStack) do React, com signals + Observables.
 *
 * - Chame num contexto de injeção (inicializador de campo de componente ou
 *   dentro de uma função `inject…LogicData`).
 * - `queryFn` roda no contexto de injeção capturado, então pode chamar os
 *   services (`getUnitsService()` usa `inject(AppClient)`).
 * - Busca uma vez ao ser criado (só no browser) e depois apenas via `refetch()`
 *   — mesmo modelo de "refetch manual" das listas paginadas.
 * - Cancelar = desinscrever: refetch e destroy abortam a requisição HTTP.
 */
export function createQuery<T>(options: { queryFn: () => Observable<T>; enabled?: boolean }): QueryRef<T> {
  const injector = inject(Injector);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  const data = signal<T | undefined>(undefined);
  const error = signal<unknown>(null);
  const isFetching = signal(false);

  let subscription: Subscription | undefined;

  function refetch() {
    subscription?.unsubscribe();
    isFetching.set(true);

    subscription = untracked(() => runInInjectionContext(injector, options.queryFn)).subscribe({
      next: (value) => {
        data.set(value);
        error.set(null);
      },
      error: (err: unknown) => {
        error.set(err);
        isFetching.set(false);
      },
      complete: () => isFetching.set(false),
    });
  }

  inject(DestroyRef).onDestroy(() => subscription?.unsubscribe());

  if (isBrowser && options.enabled !== false) refetch();

  return {
    data: data.asReadonly(),
    error: error.asReadonly(),
    isFetching: isFetching.asReadonly(),
    refetch,
  };
}

/**
 * Equivalente ao `useMutation` (TanStack) do React.
 *
 * `onSuccess`/`onError` ficam sempre no `inject…LogicData`, nunca no componente.
 */
export function createMutation<TData, TVariables = void>(options: {
  mutationFn: (variables: TVariables) => Observable<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: unknown, variables: TVariables) => void;
}): MutationRef<TData, TVariables> {
  const injector = inject(Injector);

  const data = signal<TData | undefined>(undefined);
  const error = signal<unknown>(null);
  const isPending = signal(false);

  let subscription: Subscription | undefined;

  inject(DestroyRef).onDestroy(() => subscription?.unsubscribe());

  function mutate(variables: TVariables) {
    isPending.set(true);
    error.set(null);

    subscription = untracked(() => runInInjectionContext(injector, () => options.mutationFn(variables))).subscribe({
      next: (value) => {
        data.set(value);
        isPending.set(false);
        options.onSuccess?.(value, variables);
      },
      error: (err: unknown) => {
        error.set(err);
        isPending.set(false);
        options.onError?.(err, variables);
      },
    });
  }

  return {
    mutate,
    isPending: isPending.asReadonly(),
    data: data.asReadonly(),
    error: error.asReadonly(),
  };
}
