import { Component, computed, inject, signal } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { FormButton } from '@/components/form/Button';
import { FormTextInput } from '@/components/form/TextInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { I18n } from '@/libs/i18n';
import { BuildInventoryItemLogicComponent, injectBuildInventoryItemLogicData } from '@/resources/inventory-item/logics/BuildInventoryItem';
import { CreateInventoryItemLogicComponent, injectCreateInventoryItemLogicData } from '@/resources/inventory-item/logics/CreateInventoryItem';
import { injectUpdateInventoryItemNameLogicData, UpdateInventoryItemNameLogicComponent } from '@/resources/inventory-item/logics/UpdateInventoryItemName';
import { injectUpdateInventoryItemStorageLogicData, UpdateInventoryItemStorageLogicComponent } from '@/resources/inventory-item/logics/UpdateInventoryItemStorage';
import { injectUpdateQuantityLogicData, UpdateQuantityLogicComponent } from '@/resources/inventory-item/logics/UpdateQuantity';
import type { IInventoryItem } from '@/resources/inventory-item/models/InventoryItem';
import { getInventoryItemsService } from '@/resources/inventory-item/services/getInventoryItems';
import type { PaginatedMeta } from '@/shared/types/api';
import { debouncedEffect } from '@/utils/effects';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';

type ModalKey = 'createItem' | 'updateQuantity' | 'updateName' | 'updateStorage' | 'build';

const PER_PAGE = 15;

type ItemsFilters = { search: string };

@Component({
  selector: 'app-items-page',
  imports: [
    FormButton,
    FormTextInput,
    HlmBadge,
    PageHeader,
    UtilsCard,
    UtilsModal,
    UtilsTable,
    UtilsTableCell,
    TranslatePipe,
    CreateInventoryItemLogicComponent,
    UpdateQuantityLogicComponent,
    UpdateInventoryItemNameLogicComponent,
    UpdateInventoryItemStorageLogicComponent,
    BuildInventoryItemLogicComponent,
  ],
  host: { class: 'flex flex-col flex-1 gap-6 p-4 sm:p-6' },
  template: `
    <app-page-header
      [title]="'inventory.page.title' | t"
      [subtitle]="'inventory.page.subtitle' | t"
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
      class="flex flex-col gap-6"
    >
      <app-form-text-input
        type="search"
        class="w-full max-w-xs"
        leftIcon="lucideSearch"
        [placeholder]="'inventory.search.placeholder' | t"
        [value]="filters().search"
        (valueChange)="setFilter('search', $event)"
      />

      <app-utils-table
        [rows]="items()"
        [rowKey]="rowKey"
        [loading]="itemsQuery.isFetching()"
        [emptyText]="'inventory.table.empty' | t"
        [columns]="{
          name: 'inventory.table.columns.name' | t,
          categories: 'inventory.table.columns.categories' | t,
          quantity: 'inventory.table.columns.quantity' | t,
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
            class="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-500 hover:underline"
            [title]="'inventory.rowActions.editName' | t"
            (click)="openUpdateNameModal(item)"
          >
            {{ item.name }}
          </button>
        </ng-template>

        <ng-template
          appTableCell="categories"
          [appTableCellOf]="items()"
          let-item
        >
          <div class="flex flex-wrap gap-1">
            @for (category of item.categories; track category.id) {
              <span
                hlmBadge
                class="text-white"
                [style.background-color]="category.color_hex"
              >
                {{ category.name }}
              </span>
            } @empty {
              <span class="text-xs text-gray-400">
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
            class="font-medium hover:text-primary-500 hover:underline tabular-nums"
            [title]="'inventory.rowActions.editQuantity' | t"
            (click)="openUpdateQuantityModal(item)"
          >
            {{ +item.quantity }}
          </button>
        </ng-template>

        <ng-template
          appTableCell="unit"
          [appTableCellOf]="items()"
          let-item
        >
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
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
            class="text-xs text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:underline"
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
      size="sm"
      [opened]="modals().updateName"
      [title]="'inventory.modals.updateName' | t"
      (closed)="closeModal('updateName')"
    >
      <ng-template>
        <app-update-inventory-item-name-logic
          [logicData]="updateNameLogicData"
          (cancel)="closeModal('updateName')"
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
    updateName: false,
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

  protected readonly actions = ({ item }: { item: IInventoryItem }): TableAction<IInventoryItem>[] =>
    item.components.length
      ? [{
          icon: 'lucidePackagePlus',
          label: this.i18n.t('inventory.rowActions.build'),
          variant: 'default',
          onClick: ({ item: row }) => this.openBuildModal(row),
        }]
      : [];

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

  protected readonly updateNameLogicData = injectUpdateInventoryItemNameLogicData({
    editingItemId: this.editingItemId,
    onSuccess: () => {
      this.itemsQuery.refetch();
      this.closeModal('updateName');
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

  protected openUpdateNameModal(item: IInventoryItem) {
    this.editingItem.set(item);
    this.updateNameLogicData.updateItemNameInit(item);
    this.setModal('updateName', true);
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
