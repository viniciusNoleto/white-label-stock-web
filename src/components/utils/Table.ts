import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChildren, Directive, inject, input, linkedSignal, output, TemplateRef, untracked } from '@angular/core';
import type { ButtonVariants } from '@spartan-ng/helm/button';
import { NgIcon } from '@ng-icons/core';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { FormButton } from '@/components/form/Button';
import { DEFAULT_PER_PAGE } from '@/shared/constants/pagination';
import { delayedFlag } from '@/utils/delayed-flag';
import { TranslatePipe } from '@/utils/translate.pipe';
import { UtilsLoader } from './Loader';
import { UtilsPagination } from './Pagination';

export type TableRowContext<T> = { item: T; index: number };

export type TableAction<T> = {
  /** Texto do tooltip e do `aria-label`; vira o texto do botão quando não há `icon`. */
  label: string;
  /** Nome do ícone registrado (ex.: `lucidePencil`). */
  icon?: string;
  variant?: ButtonVariants['variant'];
  onClick: (ctx: TableRowContext<T>) => void;
};

export type TableActions<T> = TableAction<T>[] | ((ctx: TableRowContext<T>) => TableAction<T>[]);

export type TableCellContext<T> = { $implicit: T; index: number };

/**
 * Célula customizada de uma coluna:
 *
 * ```html
 * <ng-template appTableCell="name" [appTableCellOf]="units()" let-unit>
 *   <span class="font-medium">{{ unit.name }}</span>
 * </ng-template>
 * ```
 *
 * `appTableCellOf` recebe as mesmas `rows` da tabela só para tipar o `let-…`.
 */
@Directive({ selector: 'ng-template[appTableCell]' })
export class UtilsTableCell<T> {
  readonly field = input.required<string>({ alias: 'appTableCell' });
  readonly of = input<readonly T[]>([], { alias: 'appTableCellOf' });
  readonly template = inject<TemplateRef<TableCellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(_dir: UtilsTableCell<T>, ctx: unknown): ctx is TableCellContext<T> {
    return true;
  }
}

@Component({
  selector: 'app-utils-table',
  imports: [NgTemplateOutlet, NgIcon, FormButton, HlmTooltip, TranslatePipe, UtilsLoader, UtilsPagination],
  host: { class: 'flex flex-col' },
  template: `
    <section
      class="relative flex flex-col"
      [attr.aria-busy]="loading()"
    >
      <!-- Só aparece se a busca demorar (delayedFlag): buscas rápidas não piscam nada. -->
      @if (showLoader()) {
        <div class="absolute inset-0 z-10 grid place-items-center bg-white/70 animate-in fade-in duration-200 dark:bg-neutral-900/70">
          <app-utils-loader />
        </div>
      }

      <div class="overflow-x-auto">
        <table class="w-max min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              @if (numbered()) {
                <th
                  scope="col"
                  class="w-px whitespace-nowrap border-b border-gray-300 bg-stone-50 py-3 pl-6 pr-2 text-right text-[13px] font-medium text-gray-500 dark:border-neutral-700 dark:bg-neutral-950/40 dark:text-gray-500"
                  [attr.aria-label]="'common.table.rowNumberLabel' | t"
                >
                  {{ 'common.table.rowNumber' | t }}
                </th>
              }

              @for (column of columnList(); track column.field) {
                <th
                  scope="col"
                  class="whitespace-nowrap border-b border-gray-300 bg-stone-50 px-6 py-3 text-[13px] font-medium text-gray-600 dark:border-neutral-700 dark:bg-neutral-950/40 dark:text-gray-400"
                >
                  {{ column.label }}
                </th>
              }

              @if (hasActions()) {
                <th
                  scope="col"
                  class="sticky right-0 z-1 whitespace-nowrap border-b border-l border-gray-300 bg-stone-50 px-6 py-3 text-right text-[13px] font-medium text-gray-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-gray-400"
                >
                  {{ 'common.table.actionsColumn' | t }}
                </th>
              }
            </tr>
          </thead>

          <tbody>
            @for (row of rows(); track rowKeyOf(row, $index); let index = $index) {
              <tr class="group">
                @if (numbered()) {
                  <td class="w-px whitespace-nowrap border-b border-gray-100 py-3.5 pl-6 pr-2 text-right text-sm tabular-nums text-gray-500 transition-colors group-hover:bg-(--row-hover-solid) dark:border-neutral-800 dark:text-gray-500">
                    {{ rowOffset() + index + 1 }}
                  </td>
                }

                @for (column of columnList(); track column.field) {
                  <!-- Linha em foco: fundo neutro um tom acima da tabela (mais escuro no claro, mais claro no escuro). -->
                  <td class="whitespace-nowrap border-b border-gray-100 px-6 py-3.5 text-sm text-gray-900 transition-colors group-hover:bg-(--row-hover-solid) dark:border-neutral-800 dark:text-gray-100">
                    @if (cellTemplates().get(column.field); as template) {
                      <ng-container *ngTemplateOutlet="template; context: { $implicit: row, index }" />
                    } @else {
                      {{ valueOf(row, column.field) }}
                    }
                  </td>
                }

                @if (hasActions()) {
                  <td class="sticky right-0 z-1 border-b border-l border-gray-100 bg-white px-4 py-2.5 transition-colors group-hover:bg-(--row-hover-solid) dark:border-neutral-800 dark:bg-neutral-900 dark:group-hover:bg-(--row-hover-solid)">
                    <div class="flex items-center justify-end gap-1.5">
                      @for (action of actionsOf(row, index); track action.label) {
                        <button
                          appButton
                          [variant]="action.variant ?? 'outline'"
                          [size]="action.icon ? 'icon-sm' : 'sm'"
                          [icon]="action.icon"
                          [label]="action.icon ? undefined : action.label"
                          [hlmTooltip]="action.label"
                          [attr.aria-label]="action.label"
                          (click)="action.onClick({ item: row, index })"
                        ></button>
                      }
                    </div>
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td
                  class="px-6 py-14"
                  [attr.colspan]="colCount()"
                >
                  <div class="flex min-h-24 flex-col items-center justify-center gap-3 text-center">
                    @if (!loading()) {
                      <span
                        aria-hidden="true"
                        class="center-flex size-12 border border-dashed border-gray-300 text-gray-400 dark:border-neutral-700 dark:text-gray-500"
                      >
                        <ng-icon
                          name="lucidePackageOpen"
                          size="22"
                        />
                      </span>

                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ emptyText() ?? ('common.table.emptyDefault' | t) }}
                      </p>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (lastPage() > 1) {
        <div class="border-t border-gray-200 px-4 py-3 dark:border-neutral-800">
          <app-utils-pagination
            [page]="page()"
            [lastPage]="lastPage()"
            (pageChange)="pageChange.emit($event)"
          />
        </div>
      }
    </section>
  `,
})
export class UtilsTable<T extends object> {
  readonly rows = input.required<readonly T[]>();
  /** Campo → título da coluna. A ordem define a ordem das colunas. */
  readonly columns = input.required<Record<string, string>>();
  readonly loading = input(false);

  protected readonly showLoader = delayedFlag(this.loading);
  readonly emptyText = input<string>();
  readonly rowKey = input<(ctx: TableRowContext<T>) => PropertyKey>();
  readonly actions = input<TableActions<T>>();

  /** Paginação: só aparece quando `lastPage > 1`. Ao trocar de página, chame `refetch()`. */
  readonly page = input(1);
  readonly lastPage = input(1);
  readonly pageChange = output<number>();

  /** Numeração das linhas, contínua entre páginas: `(page - 1) * perPage + posição`. */
  readonly numbered = input(true);
  readonly perPage = input(DEFAULT_PER_PAGE);

  /**
   * Deslocamento da numeração, recalculado só quando chegam linhas novas: a página troca o
   * `page` antes do refetch, e as linhas antigas não podem ganhar os números da página nova.
   */
  protected readonly rowOffset = linkedSignal({
    source: this.rows,
    computation: () => untracked(() => (Math.max(1, this.page()) - 1) * this.perPage()),
  });

  private readonly cells = contentChildren(UtilsTableCell);

  protected readonly cellTemplates = computed(
    () => new Map(this.cells().map((cell) => [cell.field(), cell.template as TemplateRef<TableCellContext<T>>])),
  );

  protected readonly columnList = computed(() =>
    Object.entries(this.columns()).map(([field, label]) => ({ field, label })),
  );

  protected readonly hasActions = computed(() => {
    const actions = this.actions();
    return typeof actions === 'function' || (actions?.length ?? 0) > 0;
  });

  protected readonly colCount = computed(() => this.columnList().length + (this.numbered() ? 1 : 0) + (this.hasActions() ? 1 : 0));

  protected rowKeyOf(row: T, index: number): PropertyKey {
    return this.rowKey()?.({ item: row, index }) ?? index;
  }

  protected actionsOf(row: T, index: number): TableAction<T>[] {
    const actions = this.actions();
    return typeof actions === 'function' ? actions({ item: row, index }) : (actions ?? []);
  }

  protected valueOf(row: T, field: string): unknown {
    return (row as Record<string, unknown>)[field];
  }
}
