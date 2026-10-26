import { Component, computed, input, output } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { TranslatePipe } from '@/utils/translate.pipe';

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/** Páginas visíveis: primeira, última e uma janela em volta da atual. */
export function paginationRange(page: number, lastPage: number, siblings = 1): PageItem[] {
  const total = siblings * 2 + 5;

  if (lastPage <= total) return Array.from({ length: lastPage }, (_, index) => index + 1);

  const start = Math.max(2, page - siblings);
  const end = Math.min(lastPage - 1, page + siblings);

  const items: PageItem[] = [1];

  if (start > 2) items.push('ellipsis-start');
  for (let current = start; current <= end; current++) items.push(current);
  if (end < lastPage - 1) items.push('ellipsis-end');

  items.push(lastPage);

  return items;
}

@Component({
  selector: 'app-utils-pagination',
  imports: [FormButton, TranslatePipe],
  template: `
    <nav
      class="flex items-center justify-center gap-1"
      [attr.aria-label]="'common.pagination.label' | t"
    >
      <button
        appButton
        variant="ghost"
        size="icon-sm"
        icon="lucideChevronLeft"
        [attr.aria-label]="'common.pagination.previous' | t"
        [disabled]="page() <= 1"
        (click)="pageChange.emit(page() - 1)"
      ></button>

      @for (item of items(); track item) {
        @if (item === 'ellipsis-start' || item === 'ellipsis-end') {
          <span
            class="center-flex size-8 text-sm text-muted-foreground"
            aria-hidden="true"
          >
            …
          </span>
        } @else {
          <button
            appButton
            size="icon-sm"
            [variant]="item === page() ? 'default' : 'ghost'"
            [attr.aria-current]="item === page() ? 'page' : null"
            (click)="item !== page() && pageChange.emit(item)"
          >
            {{ item }}
          </button>
        }
      }

      <button
        appButton
        variant="ghost"
        size="icon-sm"
        icon="lucideChevronRight"
        [attr.aria-label]="'common.pagination.next' | t"
        [disabled]="page() >= lastPage()"
        (click)="pageChange.emit(page() + 1)"
      ></button>
    </nav>
  `,
})
export class UtilsPagination {
  readonly page = input.required<number>();
  readonly lastPage = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly items = computed(() => paginationRange(this.page(), this.lastPage()));
}
