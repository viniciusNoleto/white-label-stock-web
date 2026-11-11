import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { I18n } from '@/libs/i18n';
import { TranslatePipe } from '@/utils/translate.pipe';
import { axisTicks, type IDashboardActivityDay } from '../models/Dashboard';

type SeriesKey = 'inflow' | 'outflow' | 'losses';

/**
 * Cores categóricas em ordem fixa (slots 1–3 da paleta validada: azul, laranja, aqua), com o passo
 * próprio do tema escuro. O aqua fica abaixo de 3:1 no fundo claro: por isso legenda com totais e a
 * visão em tabela sempre presentes (a cor nunca é a única pista).
 */
const SERIES: readonly { key: SeriesKey; labelKey: string; stroke: string; swatch: string }[] = [
  { key: 'inflow', labelKey: 'dashboard.activity.series.inflow', stroke: 'stroke-[#2a78d6] dark:stroke-[#3987e5]', swatch: 'bg-[#2a78d6] dark:bg-[#3987e5]' },
  { key: 'outflow', labelKey: 'dashboard.activity.series.outflow', stroke: 'stroke-[#eb6834] dark:stroke-[#d95926]', swatch: 'bg-[#eb6834] dark:bg-[#d95926]' },
  { key: 'losses', labelKey: 'dashboard.activity.series.losses', stroke: 'stroke-[#1baf7a] dark:stroke-[#199e70]', swatch: 'bg-[#1baf7a] dark:bg-[#199e70]' },
];

const HEIGHT = 224;

const PADDING = { top: 12, right: 12, bottom: 28, left: 40 };

/**
 * Movimentações por dia do período (entradas, saídas e baixas), em linhas. Contagens de
 * movimentações, não quantidades: produtos diferentes têm unidades diferentes.
 *
 * O SVG é desenhado em pixels na largura real do card (ResizeObserver), para o texto dos eixos não
 * distorcer. Passar o mouse (ou as setas, com foco no gráfico) mostra o dia com as três séries.
 */
@Component({
  selector: 'app-dashboard-activity-chart',
  imports: [TranslatePipe],
  host: { class: 'flex flex-col gap-4' },
  template: `
    <ul class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      @for (series of seriesList; track series.key) {
        <li class="flex items-center gap-2">
          <span
            aria-hidden="true"
            class="h-0.5 w-4 rounded-full"
            [class]="series.swatch"
          ></span>

          <span class="text-gray-600 dark:text-gray-400">
            {{ series.labelKey | t }}
          </span>

          <span class="font-semibold tabular-nums text-gray-900 dark:text-gray-100">
            {{ totals()[series.key] }}
          </span>
        </li>
      }
    </ul>

    <div
      #frame
      class="relative"
      [style.height.px]="height"
    >
      @if (width() > 0) {
        <svg
          class="block overflow-visible"
          role="img"
          [attr.width]="width()"
          [attr.height]="height"
          [attr.aria-label]="'dashboard.activity.ariaLabel' | t: { days: days().length }"
        >
          @for (tick of ticks(); track tick) {
            <line
              class="stroke-gray-200 dark:stroke-neutral-800"
              stroke-width="1"
              [attr.x1]="padding.left"
              [attr.x2]="width() - padding.right"
              [attr.y1]="y(tick)"
              [attr.y2]="y(tick)"
            />

            <text
              class="fill-gray-500 text-[11px] tabular-nums dark:fill-gray-400"
              text-anchor="end"
              dominant-baseline="middle"
              [attr.x]="padding.left - 8"
              [attr.y]="y(tick)"
            >
              {{ tick }}
            </text>
          }

          @for (label of xLabels(); track label.index) {
            <text
              class="fill-gray-500 text-[11px] tabular-nums dark:fill-gray-400"
              dominant-baseline="hanging"
              [attr.text-anchor]="label.anchor"
              [attr.x]="x(label.index)"
              [attr.y]="height - padding.bottom + 10"
            >
              {{ label.text }}
            </text>
          }

          @for (series of seriesList; track series.key) {
            <path
              fill="none"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
              [class]="series.stroke"
              [attr.d]="paths()[series.key]"
            />
          }

          @if (active(); as point) {
            <line
              class="stroke-gray-400 dark:stroke-neutral-500"
              stroke-width="1"
              [attr.x1]="x(point.index)"
              [attr.x2]="x(point.index)"
              [attr.y1]="padding.top"
              [attr.y2]="height - padding.bottom"
            />

            @for (series of seriesList; track series.key) {
              <circle
                r="4"
                stroke-width="2"
                class="fill-white dark:fill-neutral-900"
                [class]="series.stroke"
                [attr.cx]="x(point.index)"
                [attr.cy]="y(point.day[series.key])"
              />
            }
          }

          <rect
            tabindex="0"
            fill="transparent"
            class="cursor-crosshair outline-none focus-visible:stroke-primary-500"
            [attr.x]="padding.left"
            [attr.y]="padding.top"
            [attr.width]="Math.max(width() - padding.left - padding.right, 0)"
            [attr.height]="height - padding.top - padding.bottom"
            [attr.aria-label]="'dashboard.activity.focusHint' | t"
            (pointermove)="pointAt($event)"
            (pointerleave)="activeIndex.set(null)"
            (focus)="activeIndex.set(activeIndex() ?? days().length - 1)"
            (blur)="activeIndex.set(null)"
            (keydown)="onKeydown($event)"
          />
        </svg>

        @if (active(); as point) {
          <div
            role="status"
            class="pointer-events-none absolute top-0 z-10 flex min-w-40 flex-col gap-1.5 border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            [style.left.px]="tooltipLeft()"
          >
            <span class="font-medium text-gray-600 dark:text-gray-400">
              {{ formatDay(point.day.date) }}
            </span>

            @for (series of seriesList; track series.key) {
              <span class="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  class="h-0.5 w-3 rounded-full"
                  [class]="series.swatch"
                ></span>

                <span class="font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                  {{ point.day[series.key] }}
                </span>

                <span class="text-gray-500 dark:text-gray-400">
                  {{ series.labelKey | t }}
                </span>
              </span>
            }
          </div>
        }
      }
    </div>

    <details class="text-sm">
      <summary class="cursor-pointer text-gray-600 select-none hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
        {{ 'dashboard.activity.showTable' | t }}
      </summary>

      <div class="mt-3 max-h-72 overflow-auto border border-gray-200 dark:border-neutral-800">
        <table class="w-full text-left text-xs tabular-nums">
          <thead class="sticky top-0 bg-gray-50 text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
            <tr>
              <th class="px-3 py-2 font-medium">
                {{ 'dashboard.activity.date' | t }}
              </th>

              @for (series of seriesList; track series.key) {
                <th class="px-3 py-2 text-right font-medium">
                  {{ series.labelKey | t }}
                </th>
              }
            </tr>
          </thead>

          <tbody>
            @for (day of days(); track day.date) {
              <tr class="border-t border-gray-100 dark:border-neutral-800">
                <td class="px-3 py-1.5 text-gray-700 dark:text-gray-300">
                  {{ formatDay(day.date) }}
                </td>

                @for (series of seriesList; track series.key) {
                  <td class="px-3 py-1.5 text-right text-gray-900 dark:text-gray-100">
                    {{ day[series.key] }}
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </details>
  `,
})
export class DashboardActivityChart {
  private readonly i18n = inject(I18n);

  readonly days = input.required<readonly IDashboardActivityDay[]>();

  protected readonly seriesList = SERIES;
  protected readonly height = HEIGHT;
  protected readonly padding = PADDING;
  protected readonly Math = Math;

  private readonly frame = viewChild<ElementRef<HTMLElement>>('frame');

  protected readonly width = signal(0);
  protected readonly activeIndex = signal<number | null>(null);

  protected readonly totals = computed(() => {
    const totals: Record<SeriesKey, number> = { inflow: 0, outflow: 0, losses: 0 };

    for (const day of this.days()) {
      for (const series of SERIES) totals[series.key] += day[series.key];
    }

    return totals;
  });

  protected readonly ticks = computed(() => axisTicks(Math.max(0, ...this.days().flatMap((day) => SERIES.map((series) => day[series.key])))));

  private readonly yMax = computed(() => this.ticks().at(-1) ?? 1);

  protected readonly paths = computed(() => {
    const days = this.days();
    const paths = {} as Record<SeriesKey, string>;

    for (const series of SERIES) {
      paths[series.key] = days.map((day, index) => `${index === 0 ? 'M' : 'L'}${this.x(index)},${this.y(day[series.key])}`).join(' ');
    }

    return paths;
  });

  /** Primeiro, meio e último dia: o suficiente para situar o período sem amontoar datas. */
  protected readonly xLabels = computed(() => {
    const last = this.days().length - 1;
    if (last < 0) return [];

    const indexes = [...new Set([0, Math.round(last / 2), last])];

    return indexes.map((index) => ({
      index,
      text: this.formatDay(this.days()[index].date),
      anchor: index === 0 ? 'start' : index === last ? 'end' : 'middle',
    }));
  });

  protected readonly active = computed(() => {
    const index = this.activeIndex();
    const day = index === null ? undefined : this.days()[index];

    return day ? { index: index!, day } : null;
  });

  /** O tooltip vai para o lado com mais espaço, sem sair do card. */
  protected readonly tooltipLeft = computed(() => {
    const point = this.active();
    if (!point) return 0;

    const x = this.x(point.index);
    const tooltipWidth = 176;

    return x + 12 + tooltipWidth > this.width() ? Math.max(x - 12 - tooltipWidth, 0) : x + 12;
  });

  private readonly dateFormatter = computed(() => new Intl.DateTimeFormat(this.i18n.language(), { day: '2-digit', month: 'short' }));

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const element = this.frame()?.nativeElement;
      if (!element) return;

      const observer = new ResizeObserver(([entry]) => this.width.set(Math.floor(entry.contentRect.width)));
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected x(index: number): number {
    const count = this.days().length;
    const span = this.width() - PADDING.left - PADDING.right;

    return PADDING.left + (count <= 1 ? span / 2 : (span * index) / (count - 1));
  }

  protected y(value: number): number {
    const span = HEIGHT - PADDING.top - PADDING.bottom;

    return PADDING.top + span - (span * value) / this.yMax();
  }

  protected formatDay(date: string): string {
    const [year, month, day] = date.split('-').map(Number);

    return this.dateFormatter().format(new Date(year, month - 1, day));
  }

  /** O ponteiro escolhe o dia mais próximo (não precisa acertar a linha). */
  protected pointAt(event: PointerEvent) {
    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
    const count = this.days().length;
    if (count === 0 || rect.width === 0) return;

    const ratio = (event.clientX - rect.left) / rect.width;

    this.activeIndex.set(Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1)))));
  }

  protected onKeydown(event: KeyboardEvent) {
    const last = this.days().length - 1;
    const current = this.activeIndex() ?? last;
    const next = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: last }[event.key];

    if (next === undefined) return;

    event.preventDefault();
    this.activeIndex.set(Math.min(last, Math.max(0, next)));
  }
}
