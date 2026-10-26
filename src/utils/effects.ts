import { computed } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, skip } from 'rxjs';

/**
 * Equivalente ao `useDebouncedEffect` do React: roda `effectFn` `delay` ms
 * depois que `source` para de mudar, ignorando o valor inicial.
 *
 * Nas listas, passe o objeto inteiro de filtros como `source` — não campos
 * individuais. Precisa de contexto de injeção.
 */
export function debouncedEffect<T>(source: () => T, effectFn: (value: T) => void, delay = 500) {
  toObservable(computed(source))
    .pipe(skip(1), debounceTime(delay), takeUntilDestroyed())
    .subscribe(effectFn);
}
