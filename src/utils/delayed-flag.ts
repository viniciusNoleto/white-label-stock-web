import { DestroyRef, effect, inject, signal, untracked, type Signal } from '@angular/core';

export type DelayedFlagOptions = {
  /** Quanto tempo `source` precisa ficar `true` antes de a flag ligar. */
  delay?: number;
  /** Depois de ligada, a flag fica `true` por pelo menos esse tempo. */
  minDuration?: number;
};

/**
 * Flag de "mostrar loading" sem piscar: só liga se `source` continuar `true`
 * depois de `delay` ms (buscas rápidas nunca mostram nada) e, quando liga,
 * fica visível por no mínimo `minDuration` ms (não some no frame seguinte).
 *
 * Precisa de contexto de injeção.
 */
export function delayedFlag(source: () => boolean, { delay = 400, minDuration = 700 }: DelayedFlagOptions = {}): Signal<boolean> {
  const shown = signal(false);
  let shownAt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clear = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };

  effect(() => {
    const active = source();

    untracked(() => {
      clear();

      if (active) {
        if (shown()) return;

        timer = setTimeout(() => {
          shownAt = Date.now();
          shown.set(true);
        }, delay);

        return;
      }

      if (!shown()) return;

      const remaining = minDuration - (Date.now() - shownAt);

      if (remaining <= 0) shown.set(false);
      else timer = setTimeout(() => shown.set(false), remaining);
    });
  });

  inject(DestroyRef).onDestroy(clear);

  return shown.asReadonly();
}
