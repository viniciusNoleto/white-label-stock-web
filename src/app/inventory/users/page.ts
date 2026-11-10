import { Component, computed, inject, signal } from '@angular/core';
import { FormTextInput } from '@/components/form/TextInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { I18n } from '@/libs/i18n';
import { DeleteUserLogicComponent, injectDeleteUserLogicData } from '@/resources/user/logics/DeleteUser';
import type { IUser } from '@/resources/user/models/User';
import { getUsersService } from '@/resources/user/services/getUsers';
import type { PaginatedMeta } from '@/shared/types/api';
import { debouncedEffect } from '@/utils/effects';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { DEFAULT_PER_PAGE } from '@/shared/constants/pagination';

type ModalKey = 'deleteUser';

type UsersFilters = { search: string };

/** Usuários com acesso (só admin): usuário comum pode ser excluído e perde o acesso na hora; admin não. */
@Component({
  selector: 'app-users-page',
  imports: [FormTextInput, PageHeader, UtilsCard, UtilsModal, UtilsTable, UtilsTableCell, TranslatePipe, DeleteUserLogicComponent],
  host: { class: 'flex flex-col flex-1' },
  template: `
    <app-page-header
      icon="lucideUsers"
      [title]="'users.page.title' | t"
      [subtitle]="'users.page.subtitle' | t"
      [running]="usersQuery.isFetching()"
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
            {{ 'users.table.count' | t: { count: total } }}
          </p>
        }
      </div>

      <app-utils-table
        [rows]="users()"
        [rowKey]="rowKey"
        [loading]="usersQuery.isFetching()"
        [emptyText]="'users.table.empty' | t"
        [columns]="{
          name: 'users.table.columns.name' | t,
          email: 'users.table.columns.email' | t,
          role: 'users.table.columns.role' | t,
          created_at: 'users.table.columns.createdAt' | t,
        }"
        [actions]="actions"
        [page]="page()"
        [lastPage]="meta().last_page ?? 1"
        (pageChange)="changePage($event)"
      >
        <ng-template
          appTableCell="name"
          [appTableCellOf]="users()"
          let-user
        >
          <span class="font-medium text-gray-900 dark:text-gray-100">
            {{ user.name }}
          </span>
        </ng-template>

        <ng-template
          appTableCell="role"
          [appTableCellOf]="users()"
          let-user
        >
          @if (user.is_admin) {
            <span class="inline-flex h-6 items-center gap-1.5 border border-primary-300 bg-primary-50 px-2 text-xs font-medium text-primary-800 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-200">
              <span
                aria-hidden="true"
                class="size-1.5 bg-primary-500"
              ></span>

              {{ 'users.roles.admin' | t }}
            </span>
          } @else {
            <span class="inline-flex h-6 items-center gap-1.5 border border-gray-300 bg-gray-50 px-2 text-xs font-medium text-gray-700 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-gray-300">
              <span
                aria-hidden="true"
                class="size-1.5 bg-gray-400"
              ></span>

              {{ 'users.roles.user' | t }}
            </span>
          }
        </ng-template>

        <ng-template
          appTableCell="created_at"
          [appTableCellOf]="users()"
          let-user
        >
          <span class="tabular-nums text-gray-600 dark:text-gray-400">
            {{ formatDate(user.created_at) }}
          </span>
        </ng-template>
      </app-utils-table>
    </section>

    <app-utils-modal
      size="sm"
      [opened]="modals().deleteUser"
      [title]="'users.modals.delete' | t"
      (closed)="closeModal('deleteUser')"
    >
      <ng-template>
        <app-delete-user-logic
          [logicData]="deleteUserLogicData"
          [userName]="editingUser()?.name ?? ''"
          (cancel)="closeModal('deleteUser')"
        />
      </ng-template>
    </app-utils-modal>
  `,
})
export class UsersPage {
  private readonly i18n = inject(I18n);

  protected readonly page = signal(1);
  protected readonly filters = signal<UsersFilters>({ search: '' });

  protected readonly modals = signal<Record<ModalKey, boolean>>({ deleteUser: false });
  protected readonly editingUser = signal<IUser | null>(null);

  protected readonly usersQuery = createQuery({
    queryFn: () => getUsersService({
      query: {
        search: this.filters().search || undefined,
        page: this.page(),
        per_page: DEFAULT_PER_PAGE,
      },
    }),
  });

  protected readonly users = computed(() => this.usersQuery.data()?.data.items ?? []);
  protected readonly meta = computed<Partial<PaginatedMeta>>(() => this.usersQuery.data()?.data.meta ?? {});

  private readonly dateFormatter = computed(() => new Intl.DateTimeFormat(this.i18n.language(), { dateStyle: 'short' }));

  protected readonly rowKey = ({ item }: { item: IUser }) => item.id;

  // Admin não pode ser excluído (a API também recusa): a linha fica sem ação.
  protected readonly actions = ({ item }: { item: IUser }): TableAction<IUser>[] => item.is_admin
    ? []
    : [{
        icon: 'lucideTrash2',
        label: this.i18n.t('common.actions.delete'),
        variant: 'destructive',
        onClick: ({ item: row }) => this.openDeleteUserModal(row),
      }];

  protected readonly deleteUserLogicData = injectDeleteUserLogicData({
    editingUserId: computed(() => this.editingUser()?.id),
    onSuccess: () => {
      this.usersQuery.refetch();
      this.closeModal('deleteUser');
    },
  });

  constructor() {
    debouncedEffect(this.filters, () => {
      this.page.set(1);
      this.usersQuery.refetch();
    }, 500);
  }

  protected formatDate(value: string | null): string {
    return value ? this.dateFormatter().format(new Date(value)) : '—';
  }

  protected setFilter<K extends keyof UsersFilters>(key: K, value: UsersFilters[K]) {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  protected changePage(page: number) {
    this.page.set(page);
    this.usersQuery.refetch();
  }

  protected openDeleteUserModal(user: IUser) {
    this.editingUser.set(user);
    this.setModal('deleteUser', true);
  }

  protected closeModal(key: ModalKey) {
    this.setModal(key, false);
  }

  private setModal(key: ModalKey, opened: boolean) {
    this.modals.update((modals) => ({ ...modals, [key]: opened }));
  }
}
