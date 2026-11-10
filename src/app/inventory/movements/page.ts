import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FormDateInput } from '@/components/form/DateInput';
import { FormSelect } from '@/components/form/Select';
import { FormTextInput } from '@/components/form/TextInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { I18n } from '@/libs/i18n';
import { getProductsService } from '@/resources/product/services/getProducts';
import { StockMovementTypeBadge } from '@/resources/stock-movement/components/StockMovementTypeBadge';
import { EStockMovementType } from '@/resources/stock-movement/enums/StockMovementType';
import { type IStockMovement, movementDirection } from '@/resources/stock-movement/models/StockMovement';
import { getStockMovementsService } from '@/resources/stock-movement/services/getStockMovements';
import { getStoragesService } from '@/resources/storage/services/getStorages';
import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from '@/shared/constants/pagination';
import type { PaginatedMeta } from '@/shared/types/api';
import { debouncedEffect } from '@/utils/effects';
import { createQuery } from '@/utils/query';
import { dateParam, enumParam, idParam, injectFilterQueryParams } from '@/utils/query-params';
import { TranslatePipe } from '@/utils/translate.pipe';

type MovementsFilters = {
  /** Código do item ou nome do produto. */
  search: string;
  type: EStockMovementType | null;
  productId: number | null;
  storageId: number | null;
  /** `YYYY-MM-DD` ou `''` (inclusivo). */
  dateFrom: string;
  dateTo: string;
};

@Component({
  selector: 'app-movements-page',
  imports: [
    FormDateInput,
    FormSelect,
    FormTextInput,
    NgIcon,
    PageHeader,
    RouterLink,
    StockMovementTypeBadge,
    TranslatePipe,
    UtilsCard,
    UtilsTable,
    UtilsTableCell,
  ],
  host: { class: 'flex flex-col flex-1' },
  template: `
    <app-page-header
      icon="lucideHistory"
      [title]="'movements.page.title' | t"
      [subtitle]="'movements.page.subtitle' | t"
      [running]="movementsQuery.isFetching()"
    />

    <section
      appCard
      noPadding
      class="m-4 flex flex-col sm:m-8"
    >
      <div class="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-neutral-800">
        <div class="flex flex-wrap items-center gap-2">
          <app-form-text-input
            type="search"
            class="me-2 w-full max-w-xs"
            leftIcon="lucideSearch"
            [placeholder]="'movements.search.placeholder' | t"
            [value]="filters().search"
            (valueChange)="setFilter('search', $event)"
          />

          <app-form-select
            class="w-full max-w-52"
            [clearable]="true"
            [placeholder]="'movements.filters.type' | t"
            [data]="typeOptions()"
            [value]="filters().type"
            (valueChange)="setFilter('type', $any($event))"
          />

          <app-form-select
            class="w-full max-w-60"
            valueField="id"
            labelField="name"
            [clearable]="true"
            [placeholder]="'movements.filters.product' | t"
            [data]="products()"
            [value]="filters().productId"
            (valueChange)="setFilter('productId', $any($event))"
          />

          <app-form-select
            class="w-full max-w-60"
            valueField="id"
            labelField="name"
            [clearable]="true"
            [placeholder]="'movements.filters.storage' | t"
            [data]="storages()"
            [value]="filters().storageId"
            (valueChange)="setFilter('storageId', $any($event))"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ 'movements.filters.period' | t }}
          </span>

          <app-form-date-input
            class="w-40"
            [ariaLabel]="'movements.filters.dateFrom' | t"
            [maxDate]="filters().dateTo || undefined"
            [value]="filters().dateFrom"
            (valueChange)="setFilter('dateFrom', $event)"
          />

          <span
            aria-hidden="true"
            class="text-gray-400"
          >
            –
          </span>

          <app-form-date-input
            class="w-40"
            [ariaLabel]="'movements.filters.dateTo' | t"
            [minDate]="filters().dateFrom || undefined"
            [value]="filters().dateTo"
            (valueChange)="setFilter('dateTo', $event)"
          />

          @if (meta().total; as total) {
            <p class="ml-auto text-sm tabular-nums text-gray-600 dark:text-gray-400">
              {{ 'movements.table.count' | t: { count: total } }}
            </p>
          }
        </div>
      </div>

      <app-utils-table
        [rows]="movements()"
        [rowKey]="rowKey"
        [loading]="movementsQuery.isFetching()"
        [emptyText]="'movements.table.empty' | t"
        [columns]="{
          created_at: 'movements.table.columns.date' | t,
          type: 'movements.table.columns.type' | t,
          item_code: 'movements.table.columns.item' | t,
          product_name: 'movements.table.columns.product' | t,
          quantity: 'movements.table.columns.quantity' | t,
          balance: 'movements.table.columns.balance' | t,
          storage_name: 'movements.table.columns.storage' | t,
          user_name: 'movements.table.columns.user' | t,
        }"
        [page]="page()"
        [lastPage]="meta().last_page ?? 1"
        (pageChange)="changePage($event)"
      >
        <ng-template
          appTableCell="created_at"
          [appTableCellOf]="movements()"
          let-movement
        >
          <span class="text-sm whitespace-nowrap tabular-nums text-gray-700 dark:text-gray-300">
            {{ formatDateTime(movement.created_at) }}
          </span>
        </ng-template>

        <ng-template
          appTableCell="type"
          [appTableCellOf]="movements()"
          let-movement
        >
          <div class="flex flex-col items-start gap-1">
            <app-stock-movement-type-badge [type]="movement.type" />

            @if (movement.delivery_package_id) {
              <a
                routerLink="/inventory/deliveries"
                class="text-xs text-gray-500 underline-offset-4 hover:text-primary-600 hover:underline dark:text-gray-400 dark:hover:text-primary-300"
              >
                {{ 'movements.table.package' | t: { id: movement.delivery_package_id } }}
              </a>
            }
          </div>
        </ng-template>

        <ng-template
          appTableCell="item_code"
          [appTableCellOf]="movements()"
          let-movement
        >
          @if (movement.item_id) {
            <a
              routerLink="/inventory/items"
              class="font-mono text-[13px] font-medium text-gray-900 underline-offset-4 hover:text-primary-600 hover:underline dark:text-gray-100 dark:hover:text-primary-300"
              [queryParams]="{ code: movement.item_code }"
              [title]="'movements.table.openItem' | t"
            >
              {{ movement.item_code }}
            </a>
          } @else {
            <span
              class="font-mono text-[13px] text-gray-500 dark:text-gray-400"
              [title]="'movements.table.itemGone' | t"
            >
              {{ movement.item_code }}
            </span>
          }
        </ng-template>

        <ng-template
          appTableCell="product_name"
          [appTableCellOf]="movements()"
          let-movement
        >
          <span class="text-gray-800 dark:text-gray-200">
            {{ movement.product_name }}
          </span>
        </ng-template>

        <ng-template
          appTableCell="quantity"
          [appTableCellOf]="movements()"
          let-movement
        >
          @switch (direction(movement)) {
            @case ('in') {
              <span class="font-mono font-medium whitespace-nowrap tabular-nums text-emerald-700 dark:text-emerald-400">
                +{{ +movement.quantity }} {{ movement.unit_abbreviation }}
              </span>
            }

            @case ('out') {
              <span class="font-mono font-medium whitespace-nowrap tabular-nums text-red-700 dark:text-red-400">
                −{{ -movement.quantity }} {{ movement.unit_abbreviation }}
              </span>
            }

            @default {
              <span class="text-gray-400 dark:text-gray-500">
                —
              </span>
            }
          }
        </ng-template>

        <ng-template
          appTableCell="balance"
          [appTableCellOf]="movements()"
          let-movement
        >
          <span class="font-mono whitespace-nowrap tabular-nums text-gray-700 dark:text-gray-300">
            {{ +movement.balance }} {{ movement.unit_abbreviation }}
          </span>
        </ng-template>

        <ng-template
          appTableCell="storage_name"
          [appTableCellOf]="movements()"
          let-movement
        >
          @if (movement.type === types.TRANSFER) {
            <span class="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              {{ movement.previous_storage_name ?? ('movements.table.noStorage' | t) }}

              <ng-icon
                size="14"
                name="lucideArrowRight"
                [attr.aria-label]="'movements.table.to' | t"
              />

              {{ movement.storage_name ?? ('movements.table.noStorage' | t) }}
            </span>
          } @else {
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ movement.storage_name ?? '—' }}
            </span>
          }
        </ng-template>

        <ng-template
          appTableCell="user_name"
          [appTableCellOf]="movements()"
          let-movement
        >
          <span class="text-sm text-gray-700 dark:text-gray-300">
            {{ movement.user_name ?? '—' }}
          </span>
        </ng-template>
      </app-utils-table>
    </section>
  `,
})
export class MovementsPage {
  private readonly i18n = inject(I18n);

  protected readonly types = EStockMovementType;

  protected readonly page = signal(1);

  // Filtros na URL (`?search=&type=&product=&storage=&from=&to=`): o link leva ao mesmo filtro.
  private readonly filterParams = injectFilterQueryParams<MovementsFilters>({
    read: (params) => ({
      search: params.get('search') ?? '',
      type: enumParam<EStockMovementType | ''>(params, 'type', EStockMovementType, '') || null,
      productId: idParam(params, 'product'),
      storageId: idParam(params, 'storage'),
      dateFrom: dateParam(params, 'from'),
      dateTo: dateParam(params, 'to'),
    }),
    write: (filters) => ({
      search: filters.search.trim(),
      type: filters.type,
      product: filters.productId,
      storage: filters.storageId,
      from: filters.dateFrom,
      to: filters.dateTo,
    }),
  });

  protected readonly filters = signal<MovementsFilters>(this.filterParams.initial);

  protected readonly movementsQuery = createQuery({
    queryFn: () => {
      const { search, type, productId, storageId, dateFrom, dateTo } = this.filters();

      return getStockMovementsService({
        query: {
          search: search.trim() || undefined,
          type: type ?? undefined,
          product_id: productId ?? undefined,
          storage_id: storageId ?? undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page: this.page(),
          per_page: DEFAULT_PER_PAGE,
        },
      });
    },
  });

  private readonly productsQuery = createQuery({ queryFn: () => getProductsService({ query: { per_page: MAX_PER_PAGE } }) });
  private readonly storagesQuery = createQuery({ queryFn: () => getStoragesService({ query: { per_page: MAX_PER_PAGE } }) });

  protected readonly movements = computed(() => this.movementsQuery.data()?.data.items ?? []);
  protected readonly meta = computed<Partial<PaginatedMeta>>(() => this.movementsQuery.data()?.data.meta ?? {});
  protected readonly products = computed(() => this.productsQuery.data()?.data.items ?? []);
  protected readonly storages = computed(() => this.storagesQuery.data()?.data.items ?? []);

  protected readonly typeOptions = computed(() => Object.values(EStockMovementType).map((type) => ({
    value: type,
    label: this.i18n.t(`movements.types.${type}`),
  })));

  private readonly dateTimeFormatter = computed(() => new Intl.DateTimeFormat(this.i18n.language(), { dateStyle: 'short', timeStyle: 'short' }));

  protected readonly rowKey = ({ item }: { item: IStockMovement }) => item.id;

  protected readonly direction = movementDirection;

  constructor() {
    this.filterParams.bind(this.filters);

    debouncedEffect(this.filters, (filters) => {
      this.filterParams.save(filters);
      this.page.set(1);
      this.movementsQuery.refetch();
    }, 500);
  }

  protected formatDateTime(value: string) {
    return this.dateTimeFormatter().format(new Date(value));
  }

  protected setFilter<K extends keyof MovementsFilters>(key: K, value: MovementsFilters[K]) {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  protected changePage(page: number) {
    this.page.set(page);
    this.movementsQuery.refetch();
  }
}
