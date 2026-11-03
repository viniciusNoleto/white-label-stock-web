import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormButton } from '@/components/form/Button';
import { FormTextInput } from '@/components/form/TextInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { I18n } from '@/libs/i18n';
import { BuildInventoryItemLogicComponent, injectBuildInventoryItemLogicData } from '@/resources/inventory-item/logics/BuildInventoryItem';
import { CreateInventoryItemLogicComponent, injectCreateInventoryItemLogicData } from '@/resources/inventory-item/logics/CreateInventoryItem';
import { injectUpdateInventoryItemLogicData, UpdateInventoryItemLogicComponent } from '@/resources/inventory-item/logics/UpdateInventoryItem';
import { injectUpdateInventoryItemStorageLogicData, UpdateInventoryItemStorageLogicComponent } from '@/resources/inventory-item/logics/UpdateInventoryItemStorage';
import { injectUpdateQuantityLogicData, UpdateQuantityLogicComponent } from '@/resources/inventory-item/logics/UpdateQuantity';
import type { IInventoryItem } from '@/resources/inventory-item/models/InventoryItem';
import { getInventoryItemsService } from '@/resources/inventory-item/services/getInventoryItems';
import type { PaginatedMeta } from '@/shared/types/api';
import { debouncedEffect } from '@/utils/effects';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';

type ModalKey = 'createItem' | 'updateQuantity' | 'updateItem' | 'updateStorage' | 'build';

const PER_PAGE = 15;

type ItemsFilters = { search: string };

@Component({
  selector: 'app-items-page',
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
    CreateInventoryItemLogicComponent,
    UpdateQuantityLogicComponent,
    UpdateInventoryItemLogicComponent,
    UpdateInventoryItemStorageLogicComponent,
    BuildInventoryItemLogicComponent,
  ],
  host: { class: 'flex flex-col flex-1' },
  template: `
    <app-page-header
      icon="lucidePackage"
      [title]="'inventory.page.title' | t"
      [subtitle]="'inventory.page.subtitle' | t"
      [running]="itemsQuery.isFetching()"
    >
      <button
        appButton
        leftIcon="lucidePlus"
        (click)="openCreateItemModal()"
      >
        {{ 'inventory.actions.newItem' | t }}
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
          [placeholder]="'inventory.search.placeholder' | t"
          [value]="filters().search"
          (valueChange)="setFilter('search', $event)"
        />

        @if (meta().total; as total) {
          <p class="text-sm tabular-nums text-gray-600 dark:text-gray-400">
            {{ 'inventory.table.count' | t: { count: total } }}
          </p>
        }
      </div>

      <app-utils-table
        [rows]="items()"
        [rowKey]="rowKey"
        [loading]="itemsQuery.isFetching()"
        [emptyText]="'inventory.table.empty' | t"
        [columns]="{
          name: 'inventory.table.columns.name' | t,
          categories: 'inventory.table.columns.categories' | t,
          quantity: 'inventory.table.columns.quantity' | t,
          packaged: 'inventory.table.columns.packaged' | t,
          unit: 'inventory.table.columns.unit' | t,
          storage: 'inventory.table.columns.storage' | t,
        }"
        [actions]="actions"
        [page]="page()"
        [lastPage]="meta().last_page ?? 1"
        (pageChange)="changePage($event)"
      >
        <ng-template
          appTableCell="name"
          [appTableCellOf]="items()"
          let-item
        >
          <button
            type="button"
            class="font-medium text-gray-900 underline-offset-4 hover:text-primary-600 hover:underline dark:text-gray-100 dark:hover:text-primary-300"
            [title]="'inventory.rowActions.editItem' | t"
            (click)="openUpdateItemModal(item)"
          >
            {{ item.name }}
          </button>
        </ng-template>

        <ng-template
          appTableCell="categories"
          [appTableCellOf]="items()"
          let-item
        >
          <div class="flex flex-wrap gap-1.5">
            @for (category of item.categories; track category.id) {
              <!-- Etiqueta reta: a cor da categoria vira o filete à esquerda. -->
              <span
                class="inline-flex h-6 items-center border border-l-4 border-gray-200 bg-white pr-2 pl-1.5 text-xs font-medium text-gray-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200"
                [style.border-left-color]="category.color_hex"
              >
                {{ category.name }}
              </span>
            } @empty {
              <span class="text-gray-400 dark:text-gray-500">
                —
              </span>
            }
          </div>
        </ng-template>

        <ng-template
          appTableCell="quantity"
          [appTableCellOf]="items()"
          let-item
        >
          <button
            type="button"
            class="font-mono text-[15px] font-medium tabular-nums underline-offset-4 hover:text-primary-600 hover:underline dark:hover:text-primary-300"
            [class.text-gray-400]="+item.quantity === 0"
            [title]="'inventory.rowActions.editQuantity' | t"
            (click)="openUpdateQuantityModal(item)"
          >
            {{ +item.quantity }}
          </button>
        </ng-template>

        <ng-template
          appTableCell="packaged"
          [appTableCellOf]="items()"
          let-item
        >
          @if (+item.packaged_quantity > 0) {
            <a
              routerLink="/inventory/deliveries"
              class="inline-flex h-6 items-center gap-1.5 border border-amber-300 bg-amber-50 px-2 font-mono text-xs font-medium tabular-nums text-amber-800 hover:border-amber-500 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
              [title]="'inventory.table.packagedHint' | t"
            >
              <span
                aria-hidden="true"
                class="size-1.5 bg-amber-500"
              ></span>

              {{ +item.packaged_quantity }}
            </a>
          } @else {
            <span class="text-gray-400 dark:text-gray-500">
              —
            </span>
          }
        </ng-template>

        <ng-template
          appTableCell="unit"
          [appTableCellOf]="items()"
          let-item
        >
          <span class="font-mono text-xs text-gray-600 dark:text-gray-400">
            {{ item.unit.abbreviation }}
          </span>
        </ng-template>

        <ng-template
          appTableCell="storage"
          [appTableCellOf]="items()"
          let-item
        >
          <button
            type="button"
            class="text-sm text-gray-700 underline-offset-4 hover:text-primary-600 hover:underline dark:text-gray-300 dark:hover:text-primary-300"
            [title]="'inventory.rowActions.editStorage' | t"
            (click)="openUpdateStorageModal(item)"
          >
            {{ item.storage?.name ?? '—' }}
          </button>
        </ng-template>
      </app-utils-table>
    </section>

    <app-utils-modal
      size="lg"
      [opened]="modals().createItem"
      [title]="'inventory.modals.createItem' | t"
      (closed)="closeModal('createItem')"
    >
      <ng-template>
        <app-create-inventory-item-logic
          [logicData]="createItemLogicData"
          (cancel)="closeModal('createItem')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().updateQuantity"
      [title]="'inventory.modals.updateQuantity' | t"
      (closed)="closeModal('updateQuantity')"
    >
      <ng-template>
        <app-update-quantity-logic
          [logicData]="updateQuantityLogicData"
          [itemName]="editingItem()?.name ?? ''"
          (cancel)="closeModal('updateQuantity')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="md"
      [opened]="modals().updateItem"
      [title]="'inventory.modals.updateItem' | t"
      (closed)="closeModal('updateItem')"
    >
      <ng-template>
        <app-update-inventory-item-logic
          [logicData]="updateItemLogicData"
          (cancel)="closeModal('updateItem')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().updateStorage"
      [title]="'inventory.modals.updateStorage' | t"
      (closed)="closeModal('updateStorage')"
    >
      <ng-template>
        <app-update-inventory-item-storage-logic
          [logicData]="updateStorageLogicData"
          (cancel)="closeModal('updateStorage')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="md"
      [opened]="modals().build"
      [title]="'inventory.modals.build' | t: { name: editingItem()?.name ?? '' }"
      (closed)="closeModal('build')"
    >
      <ng-template>
        @if (editingItem(); as item) {
          <app-build-inventory-item-logic
            [logicData]="buildLogicData"
            [item]="item"
            (cancel)="closeModal('build')"
          />
        }
      </ng-template>
    </app-utils-modal>
  `,
})
export class ItemsPage {
  private readonly i18n = inject(I18n);

  protected readonly page = signal(1);
  protected readonly filters = signal<ItemsFilters>({ search: '' });

  protected readonly modals = signal<Record<ModalKey, boolean>>({
    createItem: false,
    updateQuantity: false,
    updateItem: false,
    updateStorage: false,
    build: false,
  });

  protected readonly editingItem = signal<IInventoryItem | null>(null);

  private readonly editingItemId = computed(() => this.editingItem()?.id);

  // `page` e `filters` são lidos no momento da busca; a lista só busca de novo
  // via refetch() (troca de página ou filtros com debounce).
  protected readonly itemsQuery = createQuery({
    queryFn: () => getInventoryItemsService({
      query: {
        search: this.filters().search || undefined,
        page: this.page(),
        per_page: PER_PAGE,
      },
    }),
  });

  protected readonly items = computed(() => this.itemsQuery.data()?.data.items ?? []);
  protected readonly meta = computed<Partial<PaginatedMeta>>(() => this.itemsQuery.data()?.data.meta ?? {});

  protected readonly rowKey = ({ item }: { item: IInventoryItem }) => item.id;

  // Editar dados, armazenamento e ajuste manual de estoque valem para todo item;
  // construir só para quem tem receita.
  protected readonly actions = ({ item }: { item: IInventoryItem }): TableAction<IInventoryItem>[] => [
    {
      icon: 'lucidePencil',
      label: this.i18n.t('inventory.rowActions.editItem'),
      onClick: ({ item: row }) => this.openUpdateItemModal(row),
    },
    {
      icon: 'lucideWarehouse',
      label: this.i18n.t('inventory.rowActions.editStorage'),
      onClick: ({ item: row }) => this.openUpdateStorageModal(row),
    },
    {
      icon: 'lucideArrowUpDown',
      label: this.i18n.t('inventory.rowActions.adjustStock'),
      onClick: ({ item: row }) => this.openUpdateQuantityModal(row),
    },
    ...(item.components.length
      ? [{
          icon: 'lucideHammer',
          label: this.i18n.t('inventory.rowActions.build'),
          variant: 'default' as const,
          onClick: ({ item: row }: { item: IInventoryItem }) => this.openBuildModal(row),
        }]
      : []),
  ];

  protected readonly createItemLogicData = injectCreateInventoryItemLogicData({
    onSuccess: () => {
      this.itemsQuery.refetch();
      this.closeModal('createItem');
    },
  });

  protected readonly updateQuantityLogicData = injectUpdateQuantityLogicData({
    editingItemId: this.editingItemId,
    onSuccess: () => {
      this.itemsQuery.refetch();
      this.closeModal('updateQuantity');
    },
  });

  protected readonly updateItemLogicData = injectUpdateInventoryItemLogicData({
    editingItemId: this.editingItemId,
    onSuccess: () => {
      this.itemsQuery.refetch();
      this.closeModal('updateItem');
    },
  });

  protected readonly updateStorageLogicData = injectUpdateInventoryItemStorageLogicData({
    editingItemId: this.editingItemId,
    onSuccess: () => {
      this.itemsQuery.refetch();
      this.closeModal('updateStorage');
    },
  });

  protected readonly buildLogicData = injectBuildInventoryItemLogicData({
    editingItemId: this.editingItemId,
    onSuccess: () => {
      this.itemsQuery.refetch();
      this.closeModal('build');
    },
  });

  constructor() {
    debouncedEffect(this.filters, () => {
      this.page.set(1);
      this.itemsQuery.refetch();
    }, 500);
  }

  protected setFilter<K extends keyof ItemsFilters>(key: K, value: ItemsFilters[K]) {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  protected changePage(page: number) {
    this.page.set(page);
    this.itemsQuery.refetch();
  }

  protected openCreateItemModal() {
    this.createItemLogicData.createInventoryItemReset();
    this.setModal('createItem', true);
  }

  protected openUpdateQuantityModal(item: IInventoryItem) {
    this.editingItem.set(item);
    this.updateQuantityLogicData.updateQuantityInit(item);
    this.setModal('updateQuantity', true);
  }

  protected openUpdateItemModal(item: IInventoryItem) {
    this.editingItem.set(item);
    this.updateItemLogicData.updateItemInit(item);
    this.setModal('updateItem', true);
  }

  protected openUpdateStorageModal(item: IInventoryItem) {
    this.editingItem.set(item);
    this.updateStorageLogicData.updateItemStorageInit(item);
    this.setModal('updateStorage', true);
  }

  protected openBuildModal(item: IInventoryItem) {
    this.editingItem.set(item);
    this.buildLogicData.buildReset();
    this.setModal('build', true);
  }

  protected closeModal(key: ModalKey) {
    this.setModal(key, false);
  }

  private setModal(key: ModalKey, opened: boolean) {
    this.modals.update((modals) => ({ ...modals, [key]: opened }));
  }
}
