import { booleanAttribute, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

/**
 * Placa da estação no topo de cada tela do inventário: ícone da estação,
 * título, subtítulo e slot à direita para ações (`<ng-content />`).
 *
 * Fica de ponta a ponta sobre a grade de planta baixa e termina numa esteira
 * que só corre enquanto `running` (ex.: a lista está buscando dados).
 */
@Component({
  selector: 'app-page-header',
  imports: [NgIcon],
  host: { class: 'relative block shrink-0 overflow-hidden border-b border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900' },
  template: `
    <div
      aria-hidden="true"
      class="absolute inset-0 bg-blueprint mask-[linear-gradient(to_left,black_10%,transparent_75%)]"
    ></div>

    <div class="relative flex flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-8 sm:py-8">
      <div class="flex min-w-0 items-center gap-4">
        @if (icon()) {
          <span
            aria-hidden="true"
            class="center-flex size-12 shrink-0 border border-primary-200 bg-white text-primary-500 dark:border-primary-900 dark:bg-neutral-900 dark:text-primary-300"
          >
            <ng-icon
              size="22"
              [name]="icon()!"
            />
          </span>
        }

        <div class="flex min-w-0 flex-col gap-1">
          <h1 class="text-2xl font-semibold tracking-tight text-gray-900 sm:text-[1.75rem] dark:text-gray-100">
            {{ title() }}
          </h1>

          @if (subtitle()) {
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ subtitle() }}
            </p>
          }
        </div>
      </div>

      <ng-content />
    </div>

    <div
      aria-hidden="true"
      class="relative h-1.5 bg-conveyor-belt"
      [class.animate-conveyor-belt]="running()"
    ></div>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  /** Ícone da estação (nome registrado em `src/libs/icons.ts`). */
  readonly icon = input<string>();
  /** Esteira em movimento — passe o `isFetching()` da query principal. */
  readonly running = input(false, { transform: booleanAttribute });
}
