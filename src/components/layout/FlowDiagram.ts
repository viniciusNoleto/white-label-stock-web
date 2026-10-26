import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '@/utils/translate.pipe';

const STATIONS = [
  { icon: 'lucidePackageOpen', labelKey: 'flow.receiving' },
  { icon: 'lucideWarehouse', labelKey: 'flow.storage' },
  { icon: 'lucideFactory', labelKey: 'flow.production' },
  { icon: 'lucideTruck', labelKey: 'flow.shipping' },
] as const;

/** Etapas do fluxo do estoque (recebimento → expedição) ligadas por esteiras animadas. */
@Component({
  selector: 'app-flow-diagram',
  imports: [NgIcon, TranslatePipe],
  host: { class: 'block' },
  template: `
    <ol
      class="flex items-start"
      [attr.aria-label]="'flow.label' | t"
    >
      @for (station of stations; track station.labelKey; let index = $index, last = $last) {
        <li
          class="flex items-start"
          [class.flex-1]="!last"
        >
          <div class="flex w-18 shrink-0 flex-col sm:w-20 items-center gap-2 text-center">
            <span class="center-flex size-12 rounded-xl border border-primary-200 bg-white/80 text-primary-500 shadow-sm dark:border-primary-900 dark:bg-neutral-900/80 dark:text-primary-300 dark:shadow-none">
              <ng-icon
                size="22"
                [name]="station.icon"
              />
            </span>

            <span class="font-mono text-[10px] text-primary-500/80 dark:text-primary-300/80">
              {{ '0' + (index + 1) }}
            </span>

            <span class="text-[11px] font-medium text-gray-700 sm:text-xs dark:text-gray-300">
              {{ station.labelKey | t }}
            </span>
          </div>

          @if (!last) {
            <span
              aria-hidden="true"
              class="relative mt-6 h-0.5 flex-1 bg-flow-dash animate-flow-dash"
            >
              <span
                class="absolute top-1/2 size-2 -translate-y-1/2 rounded-[2px] bg-primary-500 animate-flow-packet dark:bg-primary-400"
                [style.animation-delay.ms]="index * -700"
              ></span>
            </span>
          }
        </li>
      }
    </ol>
  `,
})
export class FlowDiagram {
  protected readonly stations = STATIONS;
}
