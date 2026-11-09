import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormButton } from '@/components/form/Button';
import { FormTextInput } from '@/components/form/TextInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { I18n } from '@/libs/i18n';
import { CreateItemsLogicComponent, injectCreateItemsLogicData } from '@/resources/item/logics/CreateItems';
import { CreateProductLogicComponent, injectCreateProductLogicData } from '@/resources/product/logics/CreateProduct';
import { DeleteProductLogicComponent, injectDeleteProductLogicData } from '@/resources/product/logics/DeleteProduct';
import { injectUpdateProductLogicData, UpdateProductLogicComponent } from '@/resources/product/logics/UpdateProduct';
import type { IProduct } from '@/resources/product/models/Product';
import { getProductsService } from '@/resources/product/services/getProducts';
import type { PaginatedMeta } from '@/shared/types/api';
import { debouncedEffect } from '@/utils/effects';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';

type ModalKey = 'createProduct' | 'updateProduct' | 'deleteProduct' | 'createItems';

const PER_PAGE = 15;

type ProductsFilters = { search: string };

@Component({
  selector: 'app-products-page',
  imports: [
    FormButton,
    FormTextInput,
    PageHeader,
    UtilsCard,
    UtilsModal,
    UtilsTable,
    UtilsTableCell,
    TranslatePipe,
    CreateProductLogicComponent,
    UpdateProductLogicComponent,
    DeleteProductLogicComponent,
    CreateItemsLogicComponent,
  ],
  host: { class: 'flex flex-col flex-1' },
  template: `
    <app-page-header
      icon="lucideBox"
      [title]="'products.page.title' | t"
      [subtitle]="'products.page.subtitle' | t"
      [running]="productsQuery.isFetching()"
    >
      <button
        appButton
        leftIcon="lucidePlus"
        (click)="openCreateProductModal()"
      >
        {{ 'products.actions.new' | t }}
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
          [placeholder]="'products.search.placeholder' | t"
          [value]="filters().search"
          (valueChange)="setFilter('search', $event)"
        />

        @if (meta().total; as total) {
          <p class="text-sm tabular-nums text-gray-600 dark:text-gray-400">
            {{ 'products.table.count' | t: { count: total } }}
          </p>
        }
      </div>

      <app-utils-table
        [rows]="products()"
        [rowKey]="rowKey"
        [loading]="productsQuery.isFetching()"
        [emptyText]="'products.table.empty' | t"
        [columns]="{
          name: 'products.table.columns.name' | t,
          mode: 'products.table.columns.mode' | t,
          recipe: 'products.table.columns.recipe' | t,
          shelfLife: 'products.table.columns.shelfLife' | t,
          stock: 'products.table.columns.stock' | t,
        }"
        [actions]="actions()"
        [page]="page()"
        [lastPage]="meta().last_page ?? 1"
        (pageChange)="changePage($event)"
      >
        <ng-template
          appTableCell="name"
          [appTableCellOf]="products()"
          let-product
        >
          <div class="flex flex-col gap-1">
            <button
              type="button"
              class="text-left font-medium text-gray-900 underline-offset-4 hover:text-primary-600 hover:underline dark:text-gray-100 dark:hover:text-primary-300"
              [title]="'products.rowActions.edit' | t"
              (click)="openUpdateProductModal(product)"
            >
              {{ product.name }}
            </button>

            <div class="flex flex-wrap items-center gap-1.5">
              @if (product.sku) {
                <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                  {{ product.sku }}
                </span>
              }

              @for (category of product.categories; track category.id) {
                <span
                  class="inline-flex h-5 items-center border border-l-4 border-gray-200 bg-white pr-1.5 pl-1 text-[11px] text-gray-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300"
                  [style.border-left-color]="category.color_hex"
                >
                  {{ category.name }}
                </span>
              }
            </div>
          </div>
        </ng-template>

        <ng-template
          appTableCell="mode"
          [appTableCellOf]="products()"
          let-product
        >
          <span class="text-sm text-gray-700 dark:text-gray-300">
            {{ (product.is_atomic ? 'products.table.atomic' : 'products.table.bulk') | t }}
          </span>
        </ng-template>

        <ng-template
          appTableCell="recipe"
          [appTableCellOf]="products()"
          let-product
        >
          <ul class="flex flex-col gap-0.5 text-sm">
            @for (component of product.components; track component.id) {
              <li class="flex items-baseline gap-2">
                <span class="min-w-10 font-mono text-[13px] tabular-nums text-gray-900 dark:text-gray-100">
                  {{ +component.quantity_required }}×
                </span>

                <span class="text-gray-700 dark:text-gray-300">
                  {{ component.name }}
                </span>
              </li>
            } @empty {
              <li class="text-gray-400 dark:text-gray-500">
                —
              </li>
            }
          </ul>
        </ng-template>

        <ng-template
          appTableCell="shelfLife"
          [appTableCellOf]="products()"
          let-product
        >
          <span class="text-sm tabular-nums text-gray-700 dark:text-gray-300">
            {{ product.shelf_life_days ? ('products.table.shelfLifeDays' | t: { count: product.shelf_life_days }) : ('products.table.noShelfLife' | t) }}
          </span>
        </ng-template>

        <ng-template
          appTableCell="stock"
          [appTableCellOf]="products()"
          let-product
        >
          <div class="flex flex-col gap-0.5">
            <span
              class="font-mono text-[15px] font-medium tabular-nums"
              [class.text-gray-400]="+product.stock_quantity === 0"
            >
              {{ +product.stock_quantity }} {{ product.unit.abbreviation }}
            </span>

            @if (+product.reserved_quantity > 0) {
              <span class="text-xs tabular-nums text-amber-700 dark:text-amber-300">
                {{ 'products.table.reserved' | t: { count: +product.reserved_quantity } }}
              </span>
            }
          </div>
        </ng-template>
      </app-utils-table>
    </section>

    <app-utils-modal
      size="lg"
      [opened]="modals().createProduct"
      [title]="'products.modals.create' | t"
      (closed)="closeModal('createProduct')"
    >
      <ng-template>
        <app-create-product-logic
          [logicData]="createProductLogicData"
          (cancel)="closeModal('createProduct')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="lg"
      [opened]="modals().updateProduct"
      [title]="'products.modals.update' | t"
      (closed)="closeModal('updateProduct')"
    >
      <ng-template>
        @if (editingProduct(); as product) {
          <app-update-product-logic
            [logicData]="updateProductLogicData"
            [productId]="product.id"
            (cancel)="closeModal('updateProduct')"
          />
        }
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().deleteProduct"
      [title]="'products.modals.delete' | t"
      (closed)="closeModal('deleteProduct')"
    >
      <ng-template>
        <app-delete-product-logic
          [logicData]="deleteProductLogicData"
          [productName]="editingProduct()?.name ?? ''"
          (cancel)="closeModal('deleteProduct')"
        />
      </ng-template>
    </app-utils-modal>

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
  `,
})
export class ProductsPage {
  private readonly i18n = inject(I18n);
  private readonly router = inject(Router);

  protected readonly page = signal(1);
  protected readonly filters = signal<ProductsFilters>({ search: '' });

  protected readonly modals = signal<Record<ModalKey, boolean>>({
    createProduct: false,
    updateProduct: false,
    deleteProduct: false,
    createItems: false,
  });

  protected readonly editingProduct = signal<IProduct | null>(null);

  private readonly editingProductId = computed(() => this.editingProduct()?.id);

  protected readonly productsQuery = createQuery({
    queryFn: () => getProductsService({
      query: {
        search: this.filters().search || undefined,
        page: this.page(),
        per_page: PER_PAGE,
      },
    }),
  });

  protected readonly products = computed(() => this.productsQuery.data()?.data.items ?? []);
  protected readonly meta = computed<Partial<PaginatedMeta>>(() => this.productsQuery.data()?.data.meta ?? {});

  protected readonly rowKey = ({ item }: { item: IProduct }) => item.id;

  protected readonly actions = computed<TableAction<IProduct>[]>(() => [
    {
      icon: 'lucidePackagePlus',
      label: this.i18n.t('products.rowActions.produce'),
      variant: 'default',
      onClick: ({ item }) => this.openCreateItemsModal(item),
    },
    {
      icon: 'lucideScanBarcode',
      label: this.i18n.t('products.rowActions.viewItems'),
      onClick: ({ item }) => this.router.navigate(['/inventory/items'], { queryParams: { product: item.id } }),
    },
    {
      icon: 'lucidePencil',
      label: this.i18n.t('products.rowActions.edit'),
      onClick: ({ item }) => this.openUpdateProductModal(item),
    },
    {
      icon: 'lucideTrash2',
      label: this.i18n.t('products.rowActions.delete'),
      variant: 'destructive',
      onClick: ({ item }) => this.openDeleteProductModal(item),
    },
  ]);

  protected readonly createProductLogicData = injectCreateProductLogicData({
    onSuccess: () => {
      this.productsQuery.refetch();
      this.closeModal('createProduct');
    },
  });

  protected readonly updateProductLogicData = injectUpdateProductLogicData({
    editingProductId: this.editingProductId,
    onSuccess: () => {
      this.productsQuery.refetch();
      this.closeModal('updateProduct');
    },
  });

  protected readonly deleteProductLogicData = injectDeleteProductLogicData({
    editingProductId: this.editingProductId,
    onSuccess: () => {
      this.productsQuery.refetch();
      this.closeModal('deleteProduct');
    },
  });

  protected readonly createItemsLogicData = injectCreateItemsLogicData({
    onSuccess: () => {
      this.productsQuery.refetch();
      this.closeModal('createItems');
    },
  });

  constructor() {
    debouncedEffect(this.filters, () => {
      this.page.set(1);
      this.productsQuery.refetch();
    }, 500);
  }

  protected setFilter<K extends keyof ProductsFilters>(key: K, value: ProductsFilters[K]) {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  protected changePage(page: number) {
    this.page.set(page);
    this.productsQuery.refetch();
  }

  protected openCreateProductModal() {
    this.createProductLogicData.createProductReset();
    this.setModal('createProduct', true);
  }

  protected openUpdateProductModal(product: IProduct) {
    this.editingProduct.set(product);
    this.updateProductLogicData.updateProductInit(product);
    this.setModal('updateProduct', true);
  }

  protected openDeleteProductModal(product: IProduct) {
    this.editingProduct.set(product);
    this.setModal('deleteProduct', true);
  }

  protected openCreateItemsModal(product: IProduct) {
    this.createItemsLogicData.createItemsReset(product.id);
    this.setModal('createItems', true);
  }

  protected closeModal(key: ModalKey) {
    this.setModal(key, false);
  }

  private setModal(key: ModalKey, opened: boolean) {
    this.modals.update((modals) => ({ ...modals, [key]: opened }));
  }
}
