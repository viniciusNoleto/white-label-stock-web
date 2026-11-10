import { inject, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type ParamMap, type Params, Router } from '@angular/router';

/** Parâmetro de id (`?product=12`) → `number`, ou `null` quando ausente/inválido. */
export function idParam(params: ParamMap, key: string): number | null {
  const value = Number(params.get(key));
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Parâmetro de data (`?expires_at=2026-11-09`) → `YYYY-MM-DD`, ou `''`. */
export function dateParam(params: ParamMap, key: string): string {
  const value = params.get(key) ?? '';
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

/** Valor de um enum de string vindo da URL, ou `fallback` quando não é um dos valores. */
export function enumParam<T extends string>(params: ParamMap, key: string, values: Record<string, T>, fallback: T): T {
  const value = params.get(key);
  return (Object.values(values) as string[]).includes(value ?? '') ? (value as T) : fallback;
}

function sameParams(a: Params, b: Params) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => String(a[key] ?? '') === String(b[key] ?? ''));
}

/**
 * Filtros de lista espelhados na query string, para que um link leve exatamente ao mesmo filtro.
 *
 * - `initial`: filtros lidos da URL — use como valor inicial do signal de filtros.
 * - `save(filters)`: grava na URL (substitui a entrada do histórico); valores vazios (`null`/`''`) somem.
 *   Chame no `debouncedEffect` dos filtros, junto com o `refetch()`.
 * - `bind(filters)`: link aberto com a página já ativa (mesma rota, outros parâmetros) atualiza o signal.
 *
 * Precisa de contexto de injeção.
 */
export function injectFilterQueryParams<T>({ read, write }: { read: (params: ParamMap) => T; write: (filters: T) => Params }) {
  const route = inject(ActivatedRoute);
  const router = inject(Router);

  return {
    initial: read(route.snapshot.queryParamMap),

    save(filters: T) {
      // Saindo da página (ex.: clicou num link logo depois de digitar): não atrapalha a navegação.
      if (router.currentNavigation()) return;

      const params = Object.fromEntries(Object.entries(write(filters)).filter(([, value]) => value !== null && value !== undefined && value !== ''));

      if (sameParams(params, route.snapshot.queryParams)) return;

      router.navigate([], { relativeTo: route, queryParams: params, replaceUrl: true });
    },

    bind(filters: WritableSignal<T>) {
      route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
        const next = read(params);

        if (!sameParams(write(next) as Params, write(filters()) as Params)) filters.set(next);
      });
    },
  };
}
