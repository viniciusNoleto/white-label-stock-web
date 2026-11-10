import { Component, computed, inject, signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { CreateItemCategoryLogicComponent, injectCreateItemCategoryLogicData } from '@/resources/item-category/logics/CreateItemCategory';
import { DeleteItemCategoryLogicComponent, injectDeleteItemCategoryLogicData } from '@/resources/item-category/logics/DeleteItemCategory';
import { injectUpdateItemCategoryLogicData, UpdateItemCategoryLogicComponent } from '@/resources/item-category/logics/UpdateItemCategory';
import type { IItemCategory } from '@/resources/item-category/models/ItemCategory';
import { getItemCategoriesService } from '@/resources/item-category/services/getItemCategories';
import { I18n } from '@/libs/i18n';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { PaginatedMeta } from '@/shared/types/api';
import { DEFAULT_PER_PAGE } from '@/shared/constants/pagination';

type ModalKey = 'createItemCategory' | 'updateItemCategory' | 'deleteItemCategory';

@Component({
  selector: 'app-categories-page',
  imports: [
    FormButton,
    PageHeader,
    UtilsCard,
    UtilsModal,
    UtilsTable,
    UtilsTableCell,
    TranslatePipe,
    CreateItemCategoryLogicComponent,
    UpdateItemCategoryLogicComponent,
    DeleteItemCategoryLogicComponent,
  ],
  host: { class: 'flex flex-col flex-1' },
  template: `
    <app-page-header
      icon="lucideTag"
      [title]="'categories.page.title' | t"
      [subtitle]="'categories.page.subtitle' | t"
      [running]="categoriesQuery.isFetching()"
    >
      <button
        appButton
        leftIcon="lucidePlus"
        (click)="openCreateItemCategoryModal()"
      >
        {{ 'inventory.actions.newCategory' | t }}
      </button>
    </app-page-header>

    <section
      appCard
      noPadding
      class="m-4 flex flex-col sm:m-8"
    >
      @if (meta().total; as total) {
        <div class="flex items-center justify-end border-b border-gray-200 px-4 py-3 sm:px-6 dark:border-neutral-800">
          <p class="text-sm tabular-nums text-gray-600 dark:text-gray-400">
            {{ 'categories.table.count' | t: { count: total } }}
          </p>
        </div>
      }

      <app-utils-table
        [rows]="categories()"
        [rowKey]="rowKey"
        [loading]="categoriesQuery.isFetching()"
        [emptyText]="'categories.table.empty' | t"
        [columns]="{
          name: 'categories.table.columns.name' | t,
          color_hex: 'categories.table.columns.color' | t,
        }"
        [actions]="actions()"
        [page]="page()"
        [lastPage]="meta().last_page ?? 1"
        (pageChange)="changePage($event)"
      >
        <ng-template
          appTableCell="color_hex"
          [appTableCellOf]="categories()"
          let-category
        >
          <span class="inline-flex items-center gap-2.5">
            <span
              aria-hidden="true"
              class="size-5 border border-black/10 dark:border-white/15"
              [style.background-color]="category.color_hex"
            ></span>

            <span class="font-mono text-xs uppercase text-gray-700 dark:text-gray-300">
              {{ category.color_hex }}
            </span>
          </span>
        </ng-template>
      </app-utils-table>
    </section>

    <app-utils-modal
      size="sm"
      [opened]="modals().createItemCategory"
      [title]="'inventory.modals.createCategory' | t"
      (closed)="closeModal('createItemCategory')"
    >
      <ng-template>
        <app-create-item-category-logic
          [logicData]="createItemCategoryLogicData"
          (cancel)="closeModal('createItemCategory')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().updateItemCategory"
      [title]="'inventory.modals.updateCategory' | t"
      (closed)="closeModal('updateItemCategory')"
    >
      <ng-template>
        <app-update-item-category-logic
          [logicData]="updateItemCategoryLogicData"
          (cancel)="closeModal('updateItemCategory')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().deleteItemCategory"
      [title]="'inventory.modals.deleteCategory' | t"
      (closed)="closeModal('deleteItemCategory')"
    >
      <ng-template>
        <app-delete-item-category-logic
          [logicData]="deleteItemCategoryLogicData"
          [itemCategoryName]="editingItemCategory()?.name ?? ''"
          (cancel)="closeModal('deleteItemCategory')"
        />
      </ng-template>
    </app-utils-modal>
  `,
})
export class CategoriesPage {
  private readonly i18n = inject(I18n);

  protected readonly modals = signal<Record<ModalKey, boolean>>({ createItemCategory: false, updateItemCategory: false, deleteItemCategory: false });
  protected readonly editingItemCategory = signal<IItemCategory | null>(null);

  protected readonly page = signal(1);

  protected readonly categoriesQuery = createQuery({
    queryFn: () => getItemCategoriesService({ query: { page: this.page(), per_page: DEFAULT_PER_PAGE } }),
  });

  protected readonly categories = computed(() => this.categoriesQuery.data()?.data.items ?? []);
  protected readonly meta = computed<Partial<PaginatedMeta>>(() => this.categoriesQuery.data()?.data.meta ?? {});

  protected readonly rowKey = ({ item }: { item: IItemCategory }) => item.id;

  protected readonly actions = computed<TableAction<IItemCategory>[]>(() => [
    {
      icon: 'lucidePencil',
      label: this.i18n.t('categories.actions.edit'),
      onClick: ({ item }) => this.openUpdateItemCategoryModal(item),
    },
    {
      icon: 'lucideTrash2',
      label: this.i18n.t('categories.actions.delete'),
      variant: 'destructive',
      onClick: ({ item }) => this.openDeleteItemCategoryModal(item),
    },
  ]);

  protected readonly createItemCategoryLogicData = injectCreateItemCategoryLogicData({
    onSuccess: () => {
      this.categoriesQuery.refetch();
      this.closeModal('createItemCategory');
    },
  });

  protected readonly updateItemCategoryLogicData = injectUpdateItemCategoryLogicData({
    editingItemCategoryId: computed(() => this.editingItemCategory()?.id),
    onSuccess: () => {
      this.categoriesQuery.refetch();
      this.closeModal('updateItemCategory');
    },
  });

  protected readonly deleteItemCategoryLogicData = injectDeleteItemCategoryLogicData({
    editingItemCategoryId: computed(() => this.editingItemCategory()?.id),
    onSuccess: () => {
      this.categoriesQuery.refetch();
      this.closeModal('deleteItemCategory');
    },
  });

  protected changePage(page: number) {
    this.page.set(page);
    this.categoriesQuery.refetch();
  }

  protected openCreateItemCategoryModal() {
    this.createItemCategoryLogicData.createItemCategoryReset();
    this.setModal('createItemCategory', true);
  }

  protected openUpdateItemCategoryModal(itemCategory: IItemCategory) {
    this.editingItemCategory.set(itemCategory);
    this.updateItemCategoryLogicData.updateItemCategoryInit(itemCategory);
    this.setModal('updateItemCategory', true);
  }

  protected openDeleteItemCategoryModal(itemCategory: IItemCategory) {
    this.editingItemCategory.set(itemCategory);
    this.setModal('deleteItemCategory', true);
  }

  protected closeModal(key: ModalKey) {
    this.setModal(key, false);
  }

  private setModal(key: ModalKey, opened: boolean) {
    this.modals.update((modals) => ({ ...modals, [key]: opened }));
  }
}
