import { Component } from '@angular/core';

type CargoBox = { width: number; height: number; tone: number };

/** Paletes que passam pela esteira — cada um é uma pilha de caixas (de cima para baixo). */
const CARGO: CargoBox[][] = [
  [{ width: 44, height: 30, tone: 0 }],
  [{ width: 40, height: 26, tone: 2 }, { width: 56, height: 34, tone: 1 }],
  [{ width: 34, height: 24, tone: 3 }],
  [{ width: 60, height: 38, tone: 2 }],
  [{ width: 48, height: 22, tone: 3 }, { width: 48, height: 30, tone: 0 }],
  [{ width: 38, height: 38, tone: 1 }],
  [{ width: 36, height: 24, tone: 0 }, { width: 52, height: 28, tone: 3 }],
  [{ width: 42, height: 32, tone: 2 }],
];

const TONES = [
  'bg-primary-200 border-primary-300 dark:bg-primary-900 dark:border-primary-800',
  'bg-primary-400 border-primary-500 dark:bg-primary-700 dark:border-primary-600',
  'bg-stone-200 border-stone-300 dark:bg-neutral-800 dark:border-neutral-700',
  'bg-primary-100 border-primary-200 dark:bg-primary-950 dark:border-primary-900',
];

/**
 * Fundo das telas públicas: grade de planta baixa + esteira levando paletes
 * da esquerda para a direita. Ocupa o pai inteiro (`relative`); o conteúdo
 * precisa de `relative` para ficar por cima e de espaço inferior para a esteira.
 */
@Component({
  selector: 'app-warehouse-background',
  host: {
    'aria-hidden': 'true',
    class: 'absolute inset-0 overflow-hidden pointer-events-none',
  },
  template: `
    <div class="absolute inset-0 bg-blueprint mask-[radial-gradient(ellipse_at_top,black_25%,transparent_80%)]"></div>

    <div class="absolute -top-48 left-1/2 size-176 -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl dark:bg-primary-500/15"></div>

    <div class="absolute inset-x-0 bottom-0 flex flex-col">
      <div class="flex w-max animate-conveyor">
        @for (copy of copies; track copy) {
          <div class="flex w-[max(100vw,1400px)] items-end justify-around px-8">
            @for (pallet of cargo; track $index) {
              <div class="flex flex-col items-center">
                @for (box of pallet; track $index) {
                  <span
                    class="relative block rounded-[3px] border"
                    [class]="tones[box.tone]"
                    [style.width.px]="box.width"
                    [style.height.px]="box.height"
                  >
                    <span class="absolute inset-y-0 left-1/2 w-[18%] -translate-x-1/2 bg-black/8 dark:bg-white/8"></span>

                    <span class="absolute right-1 bottom-1 h-1.5 w-3 rounded-[1px] bg-white/70 dark:bg-white/20"></span>
                  </span>
                }

                <span class="block h-1.5 w-16 rounded-[1px] bg-stone-400/70 dark:bg-neutral-700"></span>
              </div>
            }
          </div>
        }
      </div>

      <div class="h-3 bg-conveyor-belt animate-conveyor-belt border-y border-stone-400/60 dark:border-neutral-700"></div>

      <div class="h-2 bg-hazard-stripes opacity-60"></div>
    </div>
  `,
})
export class WarehouseBackground {
  protected readonly cargo = CARGO;
  protected readonly tones = TONES;
  protected readonly copies = [0, 1];
}
