import { Component, computed, inject, signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { FormSegmentedControl } from '@/components/form/SegmentedControl';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { I18n } from '@/libs/i18n';
import { EDeliveryPackageStatus } from '@/resources/delivery-package/enums/DeliveryPackageStatus';
import { EDeliveryPackageStatusFilter } from '@/resources/delivery-package/enums/DeliveryPackageStatusFilter';
import { CreateDeliveryPackageLogicComponent, injectCreateDeliveryPackageLogicData } from '@/resources/delivery-package/logics/CreateDeliveryPackage';
import { DeleteDeliveryPackageLogicComponent, injectDeleteDeliveryPackageLogicData } from '@/resources/delivery-package/logics/DeleteDeliveryPackage';
import { DeliverDeliveryPackageLogicComponent, injectDeliverDeliveryPackageLogicData } from '@/resources/delivery-package/logics/DeliverDeliveryPackage';
import { injectUpdateDeliveryPackageLogicData, UpdateDeliveryPackageLogicComponent } from '@/resources/delivery-package/logics/UpdateDeliveryPackage';
import type { IDeliveryPackage, IDeliveryPackageItem } from '@/resources/delivery-package/models/DeliveryPackage';
import { getDeliveryPackagesService } from '@/resources/delivery-package/services/getDeliveryPackages';
import type { PaginatedMeta } from '@/shared/types/api';
import { debouncedEffect } from '@/utils/effects';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { DEFAULT_PER_PAGE } from '@/shared/constants/pagination';

type ModalKey = 'createPackage' | 'updatePackage' | 'deliverPackage' | 'deletePackage';

type DeliveriesFilters = { status: EDeliveryPackageStatusFilter };

const STATUS_BY_FILTER: Record<EDeliveryPackageStatusFilter, EDeliveryPackageStatus | undefined> = {
  [EDeliveryPackageStatusFilter.PENDING]: EDeliveryPackageStatus.PENDING,
  [EDeliveryPackageStatusFilter.DELIVERED]: EDeliveryPackageStatus.DELIVERED,
  [EDeliveryPackageStatusFilter.ALL]: undefined,
};

@Component({
  selector: 'app-deliveries-page',
  imports: [
    FormButton,
    FormSegmentedControl,
    PageHeader,
    UtilsCard,
    UtilsModal,
    UtilsTable,
    UtilsTableCell,
    TranslatePipe,
    CreateDeliveryPackageLogicComponent,
    UpdateDeliveryPackageLogicComponent,
    DeliverDeliveryPackageLogicComponent,
    DeleteDeliveryPackageLogicComponent,
  ],
  host: { class: 'flex flex-col flex-1' },
  template: `
    <app-page-header
      icon="lucideTruck"
      [title]="'deliveries.page.title' | t"
      [subtitle]="'deliveries.page.subtitle' | t"
      [running]="packagesQuery.isFetching()"
    >
      <button
        appButton
        leftIcon="lucidePlus"
        (click)="openCreatePackageModal()"
      >
        {{ 'deliveries.actions.new' | t }}
      </button>
    </app-page-header>

    <section
      appCard
      noPadding
      class="m-4 flex flex-col sm:m-8"
    >
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-neutral-800">
        <app-form-segmented-control
          class="w-full max-w-md"
          [data]="[
            { value: statusFilters.PENDING, label: 'deliveries.filters.pending' | t },
            { value: statusFilters.DELIVERED, label: 'deliveries.filters.delivered' | t },
            { value: statusFilters.ALL, label: 'deliveries.filters.all' | t },
          ]"
          [value]="filters().status"
          (valueChange)="setFilter('status', $any($event))"
        />

        @if (meta().total; as total) {
          <p class="text-sm tabular-nums text-gray-600 dark:text-gray-400">
            {{ 'deliveries.table.count' | t: { count: total } }}
          </p>
        }
      </div>

      <app-utils-table
        [rows]="packages()"
        [rowKey]="rowKey"
        [loading]="packagesQuery.isFetching()"
        [emptyText]="'deliveries.table.empty' | t"
        [columns]="{
          package: 'deliveries.table.columns.package' | t,
          items: 'deliveries.table.columns.items' | t,
          notes: 'deliveries.table.columns.notes' | t,
          status: 'deliveries.table.columns.status' | t,
        }"
        [actions]="actions"
        [page]="page()"
        [lastPage]="meta().last_page ?? 1"
        (pageChange)="changePage($event)"
      >
        <ng-template
          appTableCell="package"
          [appTableCellOf]="packages()"
          let-deliveryPackage
        >
          <div class="flex flex-col gap-0.5">
            <span class="font-mono text-[13px] font-medium text-gray-900 dark:text-gray-100">
              {{ 'deliveries.table.packageNumber' | t: { id: deliveryPackage.id } }}
            </span>

            <span class="text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {{ formatDate(deliveryPackage.created_at) }}
            </span>
          </div>
        </ng-template>

        <ng-template
          appTableCell="items"
          [appTableCellOf]="packages()"
          let-deliveryPackage
        >
          <ul class="flex flex-col gap-1">
            @for (item of deliveryPackage.items; track item.product_id) {
              <li class="flex flex-col">
                <div class="flex items-baseline gap-2">
                  <span class="min-w-14 font-mono text-[13px] font-medium tabular-nums text-gray-900 dark:text-gray-100">
                    {{ +item.quantity }} {{ item.unit.abbreviation }}
                  </span>

                  <span class="text-gray-700 dark:text-gray-300">
                    {{ item.name }}
                  </span>
                </div>

                <span class="pl-16 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                  {{ codes(item) }}
                </span>
              </li>
            }
          </ul>
        </ng-template>

        <ng-template
          appTableCell="notes"
          [appTableCellOf]="packages()"
          let-deliveryPackage
        >
          <p
            class="max-w-xs whitespace-pre-line line-clamp-3 text-gray-700 dark:text-gray-300"
            [title]="deliveryPackage.notes ?? ''"
          >
            {{ deliveryPackage.notes || '—' }}
          </p>
        </ng-template>

        <ng-template
          appTableCell="status"
          [appTableCellOf]="packages()"
          let-deliveryPackage
        >
          @if (deliveryPackage.status === statuses.DELIVERED) {
            <div class="flex flex-col items-start gap-1">
              <span class="inline-flex h-6 items-center gap-1.5 border border-emerald-300 bg-emerald-50 px-2 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                <span
                  aria-hidden="true"
                  class="size-1.5 bg-emerald-600"
                ></span>

                {{ 'deliveries.status.delivered' | t }}
              </span>

              <span class="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {{ formatDate(deliveryPackage.delivered_at) }}
              </span>
            </div>
          } @else {
            <span class="inline-flex h-6 items-center gap-1.5 border border-amber-300 bg-amber-50 px-2 text-xs font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <span
                aria-hidden="true"
                class="size-1.5 bg-amber-500"
              ></span>

              {{ 'deliveries.status.pending' | t }}
            </span>
          }
        </ng-template>
      </app-utils-table>
    </section>

    <app-utils-modal
      size="lg"
      [opened]="modals().createPackage"
      [title]="'deliveries.modals.create' | t"
      (closed)="closeModal('createPackage')"
    >
      <ng-template>
        <app-create-delivery-package-logic
          [logicData]="createPackageLogicData"
          (cancel)="closeModal('createPackage')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="lg"
      [opened]="modals().updatePackage"
      [title]="'deliveries.modals.update' | t: { id: editingPackage()?.id ?? '' }"
      (closed)="closeModal('updatePackage')"
    >
      <ng-template>
        <app-update-delivery-package-logic
          [logicData]="updatePackageLogicData"
          (cancel)="closeModal('updatePackage')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="md"
      [opened]="modals().deliverPackage"
      [title]="'deliveries.modals.deliver' | t: { id: editingPackage()?.id ?? '' }"
      (closed)="closeModal('deliverPackage')"
    >
      <ng-template>
        @if (editingPackage(); as deliveryPackage) {
          <app-deliver-delivery-package-logic
            [logicData]="deliverPackageLogicData"
            [deliveryPackage]="deliveryPackage"
            (cancel)="closeModal('deliverPackage')"
          />
        }
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().deletePackage"
      [title]="'deliveries.modals.delete' | t"
      (closed)="closeModal('deletePackage')"
    >
      <ng-template>
        @if (editingPackage(); as deliveryPackage) {
          <app-delete-delivery-package-logic
            [logicData]="deletePackageLogicData"
            [deliveryPackage]="deliveryPackage"
            (cancel)="closeModal('deletePackage')"
          />
        }
      </ng-template>
    </app-utils-modal>
  `,
})
export class DeliveriesPage {
  private readonly i18n = inject(I18n);

  protected readonly statuses = EDeliveryPackageStatus;
  protected readonly statusFilters = EDeliveryPackageStatusFilter;

  protected readonly page = signal(1);
  protected readonly filters = signal<DeliveriesFilters>({ status: EDeliveryPackageStatusFilter.PENDING });

  protected readonly modals = signal<Record<ModalKey, boolean>>({
    createPackage: false,
    updatePackage: false,
    deliverPackage: false,
    deletePackage: false,
  });

  protected readonly editingPackage = signal<IDeliveryPackage | null>(null);

  private readonly editingPackageId = computed(() => this.editingPackage()?.id);

  // `page` e `filters` são lidos no momento da busca; a lista só busca de novo via refetch().
  protected readonly packagesQuery = createQuery({
    queryFn: () => getDeliveryPackagesService({
      query: {
        status: STATUS_BY_FILTER[this.filters().status],
        page: this.page(),
        per_page: DEFAULT_PER_PAGE,
      },
    }),
  });

  protected readonly packages = computed(() => this.packagesQuery.data()?.data.items ?? []);
  protected readonly meta = computed<Partial<PaginatedMeta>>(() => this.packagesQuery.data()?.data.meta ?? {});

  private readonly dateFormatter = computed(() => new Intl.DateTimeFormat(this.i18n.language(), { dateStyle: 'short', timeStyle: 'short' }));

  protected readonly rowKey = ({ item }: { item: IDeliveryPackage }) => item.id;

  // Pendente: entregar, editar e excluir. Entregue: só excluir (do histórico).
  protected readonly actions = ({ item }: { item: IDeliveryPackage }): TableAction<IDeliveryPackage>[] => [
    ...(item.status === EDeliveryPackageStatus.PENDING
      ? [
          {
            icon: 'lucidePackageCheck',
            label: this.i18n.t('deliveries.rowActions.deliver'),
            variant: 'default' as const,
            onClick: ({ item: row }: { item: IDeliveryPackage }) => this.openDeliverPackageModal(row),
          },
          {
            icon: 'lucidePencil',
            label: this.i18n.t('deliveries.rowActions.edit'),
            onClick: ({ item: row }: { item: IDeliveryPackage }) => this.openUpdatePackageModal(row),
          },
        ]
      : []),
    {
      icon: 'lucideUndo2',
      label: this.i18n.t('deliveries.rowActions.delete'),
      variant: 'destructive',
      onClick: ({ item: row }) => this.openDeletePackageModal(row),
    },
  ];

  protected readonly createPackageLogicData = injectCreateDeliveryPackageLogicData({
    onSuccess: () => {
      this.packagesQuery.refetch();
      this.closeModal('createPackage');
    },
  });

  protected readonly updatePackageLogicData = injectUpdateDeliveryPackageLogicData({
    editingPackageId: this.editingPackageId,
    onSuccess: () => {
      this.packagesQuery.refetch();
      this.closeModal('updatePackage');
    },
  });

  protected readonly deliverPackageLogicData = injectDeliverDeliveryPackageLogicData({
    editingPackageId: this.editingPackageId,
    onSuccess: () => {
      this.packagesQuery.refetch();
      this.closeModal('deliverPackage');
    },
  });

  protected readonly deletePackageLogicData = injectDeleteDeliveryPackageLogicData({
    editingPackageId: this.editingPackageId,
    onSuccess: () => {
      this.packagesQuery.refetch();
      this.closeModal('deletePackage');
    },
  });

  constructor() {
    debouncedEffect(this.filters, () => {
      this.page.set(1);
      this.packagesQuery.refetch();
    }, 500);
  }

  /** Códigos dos itens reservados/entregues (o que separar no estoque). */
  protected codes(item: IDeliveryPackageItem) {
    return item.allocations.map((allocation) => allocation.code).join(', ');
  }

  protected formatDate(value: string | null): string {
    return value ? this.dateFormatter().format(new Date(value)) : '—';
  }

  protected setFilter<K extends keyof DeliveriesFilters>(key: K, value: DeliveriesFilters[K]) {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  protected changePage(page: number) {
    this.page.set(page);
    this.packagesQuery.refetch();
  }

  protected openCreatePackageModal() {
    this.createPackageLogicData.createPackageReset();
    this.setModal('createPackage', true);
  }

  protected openUpdatePackageModal(deliveryPackage: IDeliveryPackage) {
    this.editingPackage.set(deliveryPackage);
    this.updatePackageLogicData.updatePackageInit(deliveryPackage);
    this.setModal('updatePackage', true);
  }

  protected openDeliverPackageModal(deliveryPackage: IDeliveryPackage) {
    this.editingPackage.set(deliveryPackage);
    this.setModal('deliverPackage', true);
  }

  protected openDeletePackageModal(deliveryPackage: IDeliveryPackage) {
    this.editingPackage.set(deliveryPackage);
    this.setModal('deletePackage', true);
  }

  protected closeModal(key: ModalKey) {
    this.setModal(key, false);
  }

  private setModal(key: ModalKey, opened: boolean) {
    this.modals.update((modals) => ({ ...modals, [key]: opened }));
  }
}
