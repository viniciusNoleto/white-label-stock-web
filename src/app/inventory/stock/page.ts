import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormButton } from '@/components/form/Button';
import { FormTextInput } from '@/components/form/TextInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { I18n } from '@/libs/i18n';
import { ExpirationBadge } from '@/resources/item/components/ExpirationBadge';
import { CreateItemsLogicComponent, injectCreateItemsLogicData } from '@/resources/item/logics/CreateItems';
import { injectUpdateItemQuantityLogicData, UpdateItemQuantityLogicComponent } from '@/resources/item/logics/UpdateItemQuantity';
import { EStockRowKind } from '@/resources/stock/enums/StockRowKind';
import type { IStockRow } from '@/resources/stock/models/StockRow';
import { getStockService } from '@/resources/stock/services/getStock';
import type { PaginatedMeta } from '@/shared/types/api';
import { debouncedEffect } from '@/utils/effects';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';

type ModalKey = 'createItems' | 'updateQuantity';

const PER_PAGE = 15;

type StockFilters = { search: string };

/**
 * Operação: o estoque de relance. Itens atômicos de um produto viram uma linha só
 * (4 armários → "4"); lotes a granel aparecem um por linha, com a quantidade deles.
 */
@Component({
  selector: 'app-stock-page',
  imports: [
    FormButton,
    FormTextInput,
    PageHeader,
    RouterLink,
    UtilsCard,
    UtilsModal,
    UtilsTable,
    UtilsTableCell,
    TranslatePipe,
    ExpirationBadge,
    CreateItemsLogicComponent,
    UpdateItemQuantityLogicComponent,
  ],
  host: { class: 'flex flex-col flex-1' },
  template: `
    <app-page-header
      icon="lucideLayers"
      [title]="'stock.page.title' | t"
      [subtitle]="'stock.page.subtitle' | t"
      [running]="stockQuery.isFetching()"
    >
      <button
        appButton
        leftIcon="lucidePackagePlus"
        (click)="openCreateItemsModal(null)"
      >
        {{ 'items.actions.new' | t }}
      </button>
    </app-page-header>

    <section
      appCard
      noPadding
      class="m-4 flex flex-col sm:m-8"
    >
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-neutral-800">
        <app-form-text-input
          type="search"
          class="w-full max-w-xs"
          leftIcon="lucideSearch"
          [placeholder]="'stock.search.placeholder' | t"
          [value]="filters().search"
          (valueChange)="setFilter('search', $event)"
        />

        @if (meta().total; as total) {
          <p class="text-sm tabular-nums text-gray-600 dark:text-gray-400">
            {{ 'stock.table.count' | t: { count: total } }}
          </p>
        }
      </div>

      <app-utils-table
        [rows]="rows()"
        [rowKey]="rowKey"
        [loading]="stockQuery.isFetching()"
        [emptyText]="'stock.table.empty' | t"
        [columns]="{
          product: 'stock.table.columns.product' | t,
          quantity: 'stock.table.columns.quantity' | t,
          expiration: 'stock.table.columns.expiration' | t,
          storages: 'stock.table.columns.storages' | t,
        }"
        [actions]="actions"
        [page]="page()"
        [lastPage]="meta().last_page ?? 1"
        (pageChange)="changePage($event)"
      >
        <ng-template
          appTableCell="product"
          [appTableCellOf]="rows()"
          let-row
        >
          <div class="flex flex-col gap-0.5">
            <span class="font-medium text-gray-900 dark:text-gray-100">
              {{ row.product.name }}
            </span>

            <!-- Telas pequenas: a coluna de quantidade fica fora da vista, então ela vem aqui também. -->
            <span class="font-mono text-sm font-semibold tabular-nums sm:hidden">
              {{ +row.quantity }} {{ row.product.unit.abbreviation }}
            </span>

            <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
              @if (row.item) {
                {{ 'stock.table.lot' | t: { code: row.item.code } }}
              } @else {
                {{ 'stock.table.units' | t: { count: row.items_count } }}
              }
            </span>
          </div>
        </ng-template>

        <ng-template
          appTableCell="quantity"
          [appTableCellOf]="rows()"
          let-row
        >
          <div class="flex flex-wrap items-center gap-2">
            <a
              class="font-mono text-[15px] font-semibold tabular-nums underline-offset-4 hover:text-primary-600 hover:underline dark:hover:text-primary-300"
              routerLink="/inventory/items"
              [class.text-gray-400]="+row.quantity === 0"
              [queryParams]="{ product: row.product.id }"
              [title]="'stock.rowActions.viewItems' | t"
            >
              {{ +row.quantity }} {{ row.product.unit.abbreviation }}
            </a>

            @if (+row.reserved_quantity > 0) {
              <a
                routerLink="/inventory/deliveries"
                class="inline-flex h-6 items-center border border-amber-300 bg-amber-50 px-2 text-xs font-medium tabular-nums text-amber-800 hover:border-amber-500 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                [title]="'items.table.reservedHint' | t"
              >
                {{ 'items.table.reserved' | t: { count: +row.reserved_quantity } }}
              </a>
            }
          </div>
        </ng-template>

        <ng-template
          appTableCell="expiration"
          [appTableCellOf]="rows()"
          let-row
        >
          <div class="flex flex-col items-start gap-1">
            <app-expiration-badge [expiresAt]="row.next_expires_at" />

            @if (row.kind === kinds.GROUP && +row.expired_quantity > 0) {
              <span class="text-xs font-medium tabular-nums text-red-700 dark:text-red-300">
                {{ 'stock.table.expiredCount' | t: { count: +row.expired_quantity } }}
              </span>
            }
          </div>
        </ng-template>

        <ng-template
          appTableCell="storages"
          [appTableCellOf]="rows()"
          let-row
        >
          <span class="text-sm text-gray-700 dark:text-gray-300">
            {{ storageNames(row) }}
          </span>
        </ng-template>
      </app-utils-table>
    </section>

    <app-utils-modal
      size="md"
      [opened]="modals().createItems"
      [title]="'items.modals.create' | t"
      (closed)="closeModal('createItems')"
    >
      <ng-template>
        <app-create-items-logic
          [logicData]="createItemsLogicData"
          (cancel)="closeModal('createItems')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().updateQuantity"
      [title]="'items.modals.updateQuantity' | t"
      (closed)="closeModal('updateQuantity')"
    >
      <ng-template>
        <app-update-item-quantity-logic
          [logicData]="updateQuantityLogicData"
          [itemName]="editingRow()?.item?.code ?? ''"
          (cancel)="closeModal('updateQuantity')"
        />
      </ng-template>
    </app-utils-modal>
  `,
})
export class StockPage {
  private readonly i18n = inject(I18n);
  private readonly router = inject(Router);

  protected readonly kinds = EStockRowKind;

  protected readonly page = signal(1);
  protected readonly filters = signal<StockFilters>({ search: '' });

  protected readonly modals = signal<Record<ModalKey, boolean>>({ createItems: false, updateQuantity: false });

  protected readonly editingRow = signal<IStockRow | null>(null);

  private readonly editingItemId = computed(() => this.editingRow()?.item?.id);

  protected readonly stockQuery = createQuery({
    queryFn: () => getStockService({
      query: {
        search: this.filters().search || undefined,
        page: this.page(),
        per_page: PER_PAGE,
      },
    }),
  });

  protected readonly rows = computed(() => this.stockQuery.data()?.data.items ?? []);
  protected readonly meta = computed<Partial<PaginatedMeta>>(() => this.stockQuery.data()?.data.meta ?? {});

  protected readonly rowKey = ({ item }: { item: IStockRow }) => item.key;

  protected readonly actions = ({ item }: { item: IStockRow }): TableAction<IStockRow>[] => [
    {
      icon: 'lucidePackagePlus',
      label: this.i18n.t('stock.rowActions.produce'),
      variant: 'default',
      onClick: ({ item: row }) => this.openCreateItemsModal(row.product.id),
    },
    ...(item.kind === EStockRowKind.RECORD
      ? [{
          icon: 'lucideArrowUpDown',
          label: this.i18n.t('items.rowActions.adjustStock'),
          onClick: ({ item: row }: { item: IStockRow }) => this.openUpdateQuantityModal(row),
        }]
      : []),
    {
      icon: 'lucideScanBarcode',
      label: this.i18n.t('stock.rowActions.viewItems'),
      onClick: ({ item: row }) => this.router.navigate(['/inventory/items'], { queryParams: { product: row.product.id } }),
    },
  ];

  protected readonly createItemsLogicData = injectCreateItemsLogicData({
    onSuccess: () => {
      this.stockQuery.refetch();
      this.closeModal('createItems');
    },
  });

  protected readonly updateQuantityLogicData = injectUpdateItemQuantityLogicData({
    editingItemId: this.editingItemId,
    onSuccess: () => {
      this.stockQuery.refetch();
      this.closeModal('updateQuantity');
    },
  });

  constructor() {
    debouncedEffect(this.filters, () => {
      this.page.set(1);
      this.stockQuery.refetch();
    }, 500);
  }

  protected storageNames(row: IStockRow) {
    return row.storages.map((storage) => storage.name).join(', ') || '—';
  }

  protected setFilter<K extends keyof StockFilters>(key: K, value: StockFilters[K]) {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  protected changePage(page: number) {
    this.page.set(page);
    this.stockQuery.refetch();
  }

  protected openCreateItemsModal(productId: number | null) {
    this.createItemsLogicData.createItemsReset(productId);
    this.setModal('createItems', true);
  }

  protected openUpdateQuantityModal(row: IStockRow) {
    this.editingRow.set(row);
    this.updateQuantityLogicData.updateQuantityInit(row);
    this.setModal('updateQuantity', true);
  }

  protected closeModal(key: ModalKey) {
    this.setModal(key, false);
  }

  private setModal(key: ModalKey, opened: boolean) {
    this.modals.update((modals) => ({ ...modals, [key]: opened }));
  }
}
