import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChildren, Directive, inject, input, output, TemplateRef } from '@angular/core';
import type { ButtonVariants } from '@spartan-ng/helm/button';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { FormButton } from '@/components/form/Button';
import { TranslatePipe } from '@/utils/translate.pipe';
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
  imports: [NgTemplateOutlet, FormButton, HlmSpinner, HlmTooltip, TranslatePipe, UtilsPagination],
  host: { class: 'flex flex-col gap-2' },
  template: `
    <section
      class="relative flex flex-col"
      [attr.aria-busy]="loading()"
    >
      @if (loading()) {
        <div class="absolute inset-0 z-10 center-flex rounded-lg bg-white/60 dark:bg-neutral-900/60 backdrop-blur-[2px]">
          <hlm-spinner class="text-primary-500 text-2xl" />
        </div>
      }

      <div class="overflow-x-auto">
        <table class="w-max min-w-full text-left border-separate border-spacing-0">
          <thead>
            <tr>
              @for (column of columnList(); track column.field) {
                <th
                  scope="col"
                  class="px-6 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50 dark:bg-[#1d1d1d] first:rounded-l-lg last:rounded-r-lg"
                >
                  {{ column.label }}
                </th>
              }

              @if (hasActions()) {
                <th
                  scope="col"
                  class="px-6 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center sticky right-0 z-1 bg-gray-50 dark:bg-[#1d1d1d] rounded-r-lg"
                >
                  {{ 'common.table.actionsColumn' | t }}
                </th>
              }
            </tr>
          </thead>

          <tbody>
            @for (row of rows(); track rowKeyOf(row, $index); let index = $index) {
              <tr class="group">
                @for (column of columnList(); track column.field) {
                  <td class="px-6 py-4 text-sm whitespace-nowrap border-b border-gray-100 dark:border-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-neutral-800">
                    @if (cellTemplates().get(column.field); as template) {
                      <ng-container *ngTemplateOutlet="template; context: { $implicit: row, index }" />
                    } @else {
                      {{ valueOf(row, column.field) }}
                    }
                  </td>
                }

                @if (hasActions()) {
                  <td class="px-6 py-4 text-center sticky right-0 z-1 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-neutral-800">
                    <div class="flex items-center justify-center gap-2">
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
                  class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  [attr.colspan]="colCount()"
                >
                  {{ emptyText() ?? ('common.table.emptyDefault' | t) }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (lastPage() > 1) {
        <div class="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
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
  readonly emptyText = input<string>();
  readonly rowKey = input<(ctx: TableRowContext<T>) => PropertyKey>();
  readonly actions = input<TableActions<T>>();

  /** Paginação: só aparece quando `lastPage > 1`. Ao trocar de página, chame `refetch()`. */
  readonly page = input(1);
  readonly lastPage = input(1);
  readonly pageChange = output<number>();

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

  protected readonly colCount = computed(() => this.columnList().length + (this.hasActions() ? 1 : 0));

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
