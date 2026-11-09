import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormButton } from '@/components/form/Button';
import { FormSegmentedControl } from '@/components/form/SegmentedControl';
import { FormSelect } from '@/components/form/Select';
import { FormTextInput } from '@/components/form/TextInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { I18n } from '@/libs/i18n';
import { ExpirationBadge } from '@/resources/item/components/ExpirationBadge';
import { EItemExpirationFilter } from '@/resources/item/enums/ItemExpirationFilter';
import { CreateItemsLogicComponent, injectCreateItemsLogicData } from '@/resources/item/logics/CreateItems';
import { DeleteItemLogicComponent, injectDeleteItemLogicData } from '@/resources/item/logics/DeleteItem';
import { injectUpdateItemLogicData, UpdateItemLogicComponent } from '@/resources/item/logics/UpdateItem';
import { injectUpdateItemQuantityLogicData, UpdateItemQuantityLogicComponent } from '@/resources/item/logics/UpdateItemQuantity';
import type { IItem } from '@/resources/item/models/Item';
import { getItemsService } from '@/resources/item/services/getItems';
import { getProductsService } from '@/resources/product/services/getProducts';
import type { PaginatedMeta } from '@/shared/types/api';
import { formatISODate } from '@/utils/date';
import { debouncedEffect } from '@/utils/effects';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';

type ModalKey = 'createItems' | 'updateItem' | 'updateQuantity' | 'deleteItem';

const PER_PAGE = 15;

type ItemsFilters = { search: string; productId: number | null; expiration: EItemExpirationFilter };

@Component({
  selector: 'app-items-page',
  imports: [
    FormButton,
    FormSegmentedControl,
    FormSelect,
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
    UpdateItemLogicComponent,
    UpdateItemQuantityLogicComponent,
    DeleteItemLogicComponent,
  ],
  host: { class: 'flex flex-col flex-1' },
  template: `
    <app-page-header
      icon="lucideScanBarcode"
      [title]="'items.page.title' | t"
      [subtitle]="'items.page.subtitle' | t"
      [running]="itemsQuery.isFetching()"
    >
      <button
        appButton
        leftIcon="lucidePackagePlus"
        (click)="openCreateItemsModal()"
      >
        {{ 'items.actions.new' | t }}
      </button>
    </app-page-header>

    <section
      appCard
      noPadding
      class="m-4 flex flex-col sm:m-8"
    >
      <div class="flex flex-wrap items-center gap-4 border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-neutral-800">
        <app-form-text-input
          type="search"
          class="w-full max-w-xs"
          leftIcon="lucideSearch"
          [placeholder]="'items.search.placeholder' | t"
          [value]="filters().search"
          (valueChange)="setFilter('search', $event)"
        />

        <app-form-select
          class="w-full max-w-xs"
          valueField="id"
          labelField="name"
          [clearable]="true"
          [placeholder]="'items.filters.product' | t"
          [data]="products()"
          [value]="filters().productId"
          (valueChange)="setFilter('productId', $any($event))"
        />

        <app-form-segmented-control
          class="w-full max-w-sm"
          [data]="[
            { value: expirationFilters.ALL, label: 'items.filters.expiration.all' | t },
            { value: expirationFilters.EXPIRING, label: 'items.filters.expiration.expiring' | t },
            { value: expirationFilters.EXPIRED, label: 'items.filters.expiration.expired' | t },
          ]"
          [value]="filters().expiration"
          (valueChange)="setFilter('expiration', $any($event))"
        />

        @if (meta().total; as total) {
          <p class="ml-auto text-sm tabular-nums text-gray-600 dark:text-gray-400">
            {{ 'items.table.count' | t: { count: total } }}
          </p>
        }
      </div>

      <app-utils-table
        [rows]="items()"
        [rowKey]="rowKey"
        [loading]="itemsQuery.isFetching()"
        [emptyText]="'items.table.empty' | t"
        [columns]="{
          code: 'items.table.columns.code' | t,
          product: 'items.table.columns.product' | t,
          quantity: 'items.table.columns.quantity' | t,
          producedAt: 'items.table.columns.producedAt' | t,
          expiresAt: 'items.table.columns.expiresAt' | t,
          storage: 'items.table.columns.storage' | t,
        }"
        [actions]="actions"
        [page]="page()"
        [lastPage]="meta().last_page ?? 1"
        (pageChange)="changePage($event)"
      >
        <ng-template
          appTableCell="code"
          [appTableCellOf]="items()"
          let-item
        >
          <button
            type="button"
            class="font-mono text-[13px] font-medium text-gray-900 underline-offset-4 hover:text-primary-600 hover:underline dark:text-gray-100 dark:hover:text-primary-300"
            [title]="'items.rowActions.edit' | t"
            (click)="openUpdateItemModal(item)"
          >
            {{ item.code }}
          </button>
        </ng-template>

        <ng-template
          appTableCell="product"
          [appTableCellOf]="items()"
          let-item
        >
          <span class="text-gray-800 dark:text-gray-200">
            {{ item.product.name }}
          </span>
        </ng-template>

        <ng-template
          appTableCell="quantity"
          [appTableCellOf]="items()"
          let-item
        >
          <div class="flex flex-wrap items-center gap-2">
            @if (item.product.is_atomic) {
              <span class="font-mono text-[15px] tabular-nums">
                1 {{ item.product.unit.abbreviation }}
              </span>
            } @else {
              <button
                type="button"
                class="font-mono text-[15px] font-medium tabular-nums underline-offset-4 hover:text-primary-600 hover:underline dark:hover:text-primary-300"
                [class.text-gray-400]="+item.quantity === 0"
                [title]="'items.rowActions.adjustStock' | t"
                (click)="openUpdateQuantityModal(item)"
              >
                {{ +item.quantity }} {{ item.product.unit.abbreviation }}
              </button>
            }

            @if (+item.reserved_quantity > 0) {
              <a
                routerLink="/inventory/deliveries"
                class="inline-flex h-6 items-center border border-amber-300 bg-amber-50 px-2 text-xs font-medium tabular-nums text-amber-800 hover:border-amber-500 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                [title]="'items.table.reservedHint' | t"
              >
                {{ 'items.table.reserved' | t: { count: +item.reserved_quantity } }}
              </a>
            }
          </div>
        </ng-template>

        <ng-template
          appTableCell="producedAt"
          [appTableCellOf]="items()"
          let-item
        >
          <span class="text-sm tabular-nums text-gray-700 dark:text-gray-300">
            {{ formatDate(item.produced_at) }}
          </span>
        </ng-template>

        <ng-template
          appTableCell="expiresAt"
          [appTableCellOf]="items()"
          let-item
        >
          <app-expiration-badge [expiresAt]="item.expires_at" />
        </ng-template>

        <ng-template
          appTableCell="storage"
          [appTableCellOf]="items()"
          let-item
        >
          <span class="text-sm text-gray-700 dark:text-gray-300">
            {{ item.storage?.name ?? '—' }}
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
      [opened]="modals().updateItem"
      [title]="'items.modals.update' | t: { code: editingItem()?.code ?? '' }"
      (closed)="closeModal('updateItem')"
    >
      <ng-template>
        <app-update-item-logic
          [logicData]="updateItemLogicData"
          (cancel)="closeModal('updateItem')"
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
          [itemName]="editingItem()?.code ?? ''"
          (cancel)="closeModal('updateQuantity')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().deleteItem"
      [title]="'items.modals.delete' | t"
      (closed)="closeModal('deleteItem')"
    >
      <ng-template>
        <app-delete-item-logic
          [logicData]="deleteItemLogicData"
          [itemCode]="editingItem()?.code ?? ''"
          (cancel)="closeModal('deleteItem')"
        />
      </ng-template>
    </app-utils-modal>
  `,
})
export class ItemsPage {
  private readonly i18n = inject(I18n);

  protected readonly expirationFilters = EItemExpirationFilter;

  protected readonly page = signal(1);
  // `?product=ID` (vindo de Produtos/Operação) já abre filtrado.
  protected readonly filters = signal<ItemsFilters>({
    search: '',
    productId: Number(inject(ActivatedRoute).snapshot.queryParamMap.get('product')) || null,
    expiration: EItemExpirationFilter.ALL,
  });

  protected readonly modals = signal<Record<ModalKey, boolean>>({
    createItems: false,
    updateItem: false,
    updateQuantity: false,
    deleteItem: false,
  });

  protected readonly editingItem = signal<IItem | null>(null);

  private readonly editingItemId = computed(() => this.editingItem()?.id);

  protected readonly itemsQuery = createQuery({
    queryFn: () => {
      const { search, productId, expiration } = this.filters();

      return getItemsService({
        query: {
          search: search || undefined,
          product_id: productId ?? undefined,
          expiration: expiration === EItemExpirationFilter.ALL ? undefined : expiration,
          page: this.page(),
          per_page: PER_PAGE,
        },
      });
    },
  });

  private readonly productsQuery = createQuery({ queryFn: () => getProductsService({ query: { per_page: 100 } }) });

  protected readonly items = computed(() => this.itemsQuery.data()?.data.items ?? []);
  protected readonly meta = computed<Partial<PaginatedMeta>>(() => this.itemsQuery.data()?.data.meta ?? {});
  protected readonly products = computed(() => this.productsQuery.data()?.data.items ?? []);

  protected readonly rowKey = ({ item }: { item: IItem }) => item.id;

  // Ajustar quantidade só existe para lotes a granel (o item atômico é uma unidade).
  protected readonly actions = ({ item }: { item: IItem }): TableAction<IItem>[] => [
    {
      icon: 'lucidePencil',
      label: this.i18n.t('items.rowActions.edit'),
      onClick: ({ item: row }) => this.openUpdateItemModal(row),
    },
    ...(item.product.is_atomic
      ? []
      : [{
          icon: 'lucideArrowUpDown',
          label: this.i18n.t('items.rowActions.adjustStock'),
          onClick: ({ item: row }: { item: IItem }) => this.openUpdateQuantityModal(row),
        }]),
    {
      icon: 'lucideTrash2',
      label: this.i18n.t('items.rowActions.delete'),
      variant: 'destructive',
      onClick: ({ item: row }) => this.openDeleteItemModal(row),
    },
  ];

  protected readonly createItemsLogicData = injectCreateItemsLogicData({
    onSuccess: () => {
      this.itemsQuery.refetch();
      this.closeModal('createItems');
    },
  });

  protected readonly updateItemLogicData = injectUpdateItemLogicData({
    editingItemId: this.editingItemId,
    onSuccess: () => {
      this.itemsQuery.refetch();
      this.closeModal('updateItem');
    },
  });

  protected readonly updateQuantityLogicData = injectUpdateItemQuantityLogicData({
    editingItemId: this.editingItemId,
    onSuccess: () => {
      this.itemsQuery.refetch();
      this.closeModal('updateQuantity');
    },
  });

  protected readonly deleteItemLogicData = injectDeleteItemLogicData({
    editingItemId: this.editingItemId,
    onSuccess: () => {
      this.itemsQuery.refetch();
      this.closeModal('deleteItem');
    },
  });

  constructor() {
    debouncedEffect(this.filters, () => {
      this.page.set(1);
      this.itemsQuery.refetch();
    }, 500);
  }

  protected formatDate(value: string) {
    return formatISODate(value, this.i18n.language());
  }

  protected setFilter<K extends keyof ItemsFilters>(key: K, value: ItemsFilters[K]) {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  protected changePage(page: number) {
    this.page.set(page);
    this.itemsQuery.refetch();
  }

  protected openCreateItemsModal() {
    this.createItemsLogicData.createItemsReset(this.filters().productId);
    this.setModal('createItems', true);
  }

  protected openUpdateItemModal(item: IItem) {
    this.editingItem.set(item);
    this.updateItemLogicData.updateItemInit(item);
    this.setModal('updateItem', true);
  }

  protected openUpdateQuantityModal(item: IItem) {
    this.editingItem.set(item);
    this.updateQuantityLogicData.updateQuantityInit(item);
    this.setModal('updateQuantity', true);
  }

  protected openDeleteItemModal(item: IItem) {
    this.editingItem.set(item);
    this.setModal('deleteItem', true);
  }

  protected closeModal(key: ModalKey) {
    this.setModal(key, false);
  }

  private setModal(key: ModalKey, opened: boolean) {
    this.modals.update((modals) => ({ ...modals, [key]: opened }));
  }
}
