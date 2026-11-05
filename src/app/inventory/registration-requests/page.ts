import { Component, computed, inject, signal } from '@angular/core';
import { FormTextInput } from '@/components/form/TextInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { I18n } from '@/libs/i18n';
import { ApproveRegistrationRequestLogicComponent, injectApproveRegistrationRequestLogicData } from '@/resources/registration-request/logics/ApproveRegistrationRequest';
import { injectRejectRegistrationRequestLogicData, RejectRegistrationRequestLogicComponent } from '@/resources/registration-request/logics/RejectRegistrationRequest';
import type { IRegistrationRequest } from '@/resources/registration-request/models/RegistrationRequest';
import { getRegistrationRequestsService } from '@/resources/registration-request/services/getRegistrationRequests';
import type { PaginatedMeta } from '@/shared/types/api';
import { debouncedEffect } from '@/utils/effects';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';

type ModalKey = 'approveRequest' | 'rejectRequest';

type RegistrationRequestsFilters = { search: string };

const PER_PAGE = 15;

/** Fila de pedidos de cadastro (só admin): aprovar cria o usuário, recusar exclui o pedido. */
@Component({
  selector: 'app-registration-requests-page',
  imports: [
    FormTextInput,
    PageHeader,
    UtilsCard,
    UtilsModal,
    UtilsTable,
    UtilsTableCell,
    TranslatePipe,
    ApproveRegistrationRequestLogicComponent,
    RejectRegistrationRequestLogicComponent,
  ],
  host: { class: 'flex flex-col flex-1' },
  template: `
    <app-page-header
      icon="lucideUserPlus"
      [title]="'registrationRequests.page.title' | t"
      [subtitle]="'registrationRequests.page.subtitle' | t"
      [running]="requestsQuery.isFetching()"
    />

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
          [placeholder]="'users.search.placeholder' | t"
          [value]="filters().search"
          (valueChange)="setFilter('search', $event)"
        />

        @if (meta().total; as total) {
          <p class="text-sm tabular-nums text-gray-600 dark:text-gray-400">
            {{ 'registrationRequests.table.count' | t: { count: total } }}
          </p>
        }
      </div>

      <app-utils-table
        [rows]="requests()"
        [rowKey]="rowKey"
        [loading]="requestsQuery.isFetching()"
        [emptyText]="'registrationRequests.table.empty' | t"
        [columns]="{
          name: 'users.table.columns.name' | t,
          email: 'users.table.columns.email' | t,
          created_at: 'registrationRequests.table.columns.requestedAt' | t,
        }"
        [actions]="actions()"
        [page]="page()"
        [lastPage]="meta().last_page ?? 1"
        (pageChange)="changePage($event)"
      >
        <ng-template
          appTableCell="name"
          [appTableCellOf]="requests()"
          let-request
        >
          <span class="font-medium text-gray-900 dark:text-gray-100">
            {{ request.name }}
          </span>
        </ng-template>

        <ng-template
          appTableCell="created_at"
          [appTableCellOf]="requests()"
          let-request
        >
          <span class="tabular-nums text-gray-600 dark:text-gray-400">
            {{ formatDate(request.created_at) }}
          </span>
        </ng-template>
      </app-utils-table>
    </section>

    <app-utils-modal
      size="sm"
      [opened]="modals().approveRequest"
      [title]="'registrationRequests.modals.approve' | t"
      (closed)="closeModal('approveRequest')"
    >
      <ng-template>
        <app-approve-registration-request-logic
          [logicData]="approveRequestLogicData"
          [requesterName]="editingRequest()?.name ?? ''"
          [requesterEmail]="editingRequest()?.email ?? ''"
          (cancel)="closeModal('approveRequest')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().rejectRequest"
      [title]="'registrationRequests.modals.reject' | t"
      (closed)="closeModal('rejectRequest')"
    >
      <ng-template>
        <app-reject-registration-request-logic
          [logicData]="rejectRequestLogicData"
          [requesterName]="editingRequest()?.name ?? ''"
          [requesterEmail]="editingRequest()?.email ?? ''"
          (cancel)="closeModal('rejectRequest')"
        />
      </ng-template>
    </app-utils-modal>
  `,
})
export class RegistrationRequestsPage {
  private readonly i18n = inject(I18n);

  protected readonly page = signal(1);
  protected readonly filters = signal<RegistrationRequestsFilters>({ search: '' });

  protected readonly modals = signal<Record<ModalKey, boolean>>({ approveRequest: false, rejectRequest: false });
  protected readonly editingRequest = signal<IRegistrationRequest | null>(null);

  private readonly editingRequestId = computed(() => this.editingRequest()?.id);

  protected readonly requestsQuery = createQuery({
    queryFn: () => getRegistrationRequestsService({
      query: {
        search: this.filters().search || undefined,
        page: this.page(),
        per_page: PER_PAGE,
      },
    }),
  });

  protected readonly requests = computed(() => this.requestsQuery.data()?.data.items ?? []);
  protected readonly meta = computed<Partial<PaginatedMeta>>(() => this.requestsQuery.data()?.data.meta ?? {});

  private readonly dateFormatter = computed(() => new Intl.DateTimeFormat(this.i18n.language(), { dateStyle: 'short', timeStyle: 'short' }));

  protected readonly rowKey = ({ item }: { item: IRegistrationRequest }) => item.id;

  protected readonly actions = computed<TableAction<IRegistrationRequest>[]>(() => [
    {
      icon: 'lucideCheck',
      label: this.i18n.t('registrationRequests.actions.approve'),
      variant: 'default',
      onClick: ({ item }) => this.openModal('approveRequest', item),
    },
    {
      icon: 'lucideX',
      label: this.i18n.t('registrationRequests.actions.reject'),
      variant: 'destructive',
      onClick: ({ item }) => this.openModal('rejectRequest', item),
    },
  ]);

  protected readonly approveRequestLogicData = injectApproveRegistrationRequestLogicData({
    editingRegistrationRequestId: this.editingRequestId,
    onSuccess: () => {
      this.requestsQuery.refetch();
      this.closeModal('approveRequest');
    },
  });

  protected readonly rejectRequestLogicData = injectRejectRegistrationRequestLogicData({
    editingRegistrationRequestId: this.editingRequestId,
    onSuccess: () => {
      this.requestsQuery.refetch();
      this.closeModal('rejectRequest');
    },
  });

  constructor() {
    debouncedEffect(this.filters, () => {
      this.page.set(1);
      this.requestsQuery.refetch();
    }, 500);
  }

  protected formatDate(value: string | null): string {
    return value ? this.dateFormatter().format(new Date(value)) : '—';
  }

  protected setFilter<K extends keyof RegistrationRequestsFilters>(key: K, value: RegistrationRequestsFilters[K]) {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  protected changePage(page: number) {
    this.page.set(page);
    this.requestsQuery.refetch();
  }

  protected closeModal(key: ModalKey) {
    this.setModal(key, false);
  }

  private openModal(key: ModalKey, request: IRegistrationRequest) {
    this.editingRequest.set(request);
    this.setModal(key, true);
  }

  private setModal(key: ModalKey, opened: boolean) {
    this.modals.update((modals) => ({ ...modals, [key]: opened }));
  }
}
