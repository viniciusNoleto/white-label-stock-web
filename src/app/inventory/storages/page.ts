import { Component, computed, inject, signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { CreateStorageLogicComponent, injectCreateStorageLogicData } from '@/resources/storage/logics/CreateStorage';
import { DeleteStorageLogicComponent, injectDeleteStorageLogicData } from '@/resources/storage/logics/DeleteStorage';
import { injectUpdateStorageLogicData, UpdateStorageLogicComponent } from '@/resources/storage/logics/UpdateStorage';
import type { IStorage } from '@/resources/storage/models/Storage';
import { getStoragesService } from '@/resources/storage/services/getStorages';
import { I18n } from '@/libs/i18n';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';

type ModalKey = 'createStorage' | 'updateStorage' | 'deleteStorage';

@Component({
  selector: 'app-storages-page',
  imports: [
    FormButton,
    PageHeader,
    UtilsCard,
    UtilsModal,
    UtilsTable,
    UtilsTableCell,
    TranslatePipe,
    CreateStorageLogicComponent,
    UpdateStorageLogicComponent,
    DeleteStorageLogicComponent,
  ],
  host: { class: 'flex flex-col flex-1 gap-6 p-4 sm:p-6' },
  template: `
    <app-page-header
      [title]="'storages.page.title' | t"
      [subtitle]="'storages.page.subtitle' | t"
    >
      <button
        appButton
        leftIcon="lucidePlus"
        (click)="openCreateStorageModal()"
      >
        {{ 'storages.actions.new' | t }}
      </button>
    </app-page-header>

    <section appCard>
      <app-utils-table
        [rows]="storages()"
        [rowKey]="rowKey"
        [loading]="storagesQuery.isFetching()"
        [emptyText]="'storages.table.empty' | t"
        [columns]="{
          name: 'storages.table.columns.name' | t,
          description: 'storages.table.columns.description' | t,
        }"
        [actions]="actions()"
      >
        <ng-template
          appTableCell="description"
          [appTableCellOf]="storages()"
          let-storage
        >
          <span class="block max-w-md truncate text-gray-600 dark:text-gray-400">
            {{ storage.description || '—' }}
          </span>
        </ng-template>
      </app-utils-table>
    </section>

    <app-utils-modal
      size="sm"
      [opened]="modals().createStorage"
      [title]="'storages.modals.create' | t"
      (closed)="closeModal('createStorage')"
    >
      <ng-template>
        <app-create-storage-logic
          [logicData]="createStorageLogicData"
          (cancel)="closeModal('createStorage')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().updateStorage"
      [title]="'storages.modals.update' | t"
      (closed)="closeModal('updateStorage')"
    >
      <ng-template>
        <app-update-storage-logic
          [logicData]="updateStorageLogicData"
          (cancel)="closeModal('updateStorage')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().deleteStorage"
      [title]="'storages.modals.delete' | t"
      (closed)="closeModal('deleteStorage')"
    >
      <ng-template>
        <app-delete-storage-logic
          [logicData]="deleteStorageLogicData"
          [storageName]="editingStorage()?.name ?? ''"
          (cancel)="closeModal('deleteStorage')"
        />
      </ng-template>
    </app-utils-modal>
  `,
})
export class StoragesPage {
  private readonly i18n = inject(I18n);

  protected readonly modals = signal<Record<ModalKey, boolean>>({ createStorage: false, updateStorage: false, deleteStorage: false });
  protected readonly editingStorage = signal<IStorage | null>(null);

  protected readonly storagesQuery = createQuery({ queryFn: () => getStoragesService() });

  protected readonly storages = computed(() => this.storagesQuery.data()?.data ?? []);

  protected readonly rowKey = ({ item }: { item: IStorage }) => item.id;

  protected readonly actions = computed<TableAction<IStorage>[]>(() => [
    {
      icon: 'lucidePencil',
      label: this.i18n.t('storages.actions.edit'),
      onClick: ({ item }) => this.openUpdateStorageModal(item),
    },
    {
      icon: 'lucideTrash2',
      label: this.i18n.t('storages.actions.delete'),
      variant: 'destructive',
      onClick: ({ item }) => this.openDeleteStorageModal(item),
    },
  ]);

  protected readonly createStorageLogicData = injectCreateStorageLogicData({
    onSuccess: () => {
      this.storagesQuery.refetch();
      this.closeModal('createStorage');
    },
  });

  protected readonly updateStorageLogicData = injectUpdateStorageLogicData({
    editingStorageId: computed(() => this.editingStorage()?.id),
    onSuccess: () => {
      this.storagesQuery.refetch();
      this.closeModal('updateStorage');
    },
  });

  protected readonly deleteStorageLogicData = injectDeleteStorageLogicData({
    editingStorageId: computed(() => this.editingStorage()?.id),
    onSuccess: () => {
      this.storagesQuery.refetch();
      this.closeModal('deleteStorage');
    },
  });

  protected openCreateStorageModal() {
    this.createStorageLogicData.createStorageReset();
    this.setModal('createStorage', true);
  }

  protected openUpdateStorageModal(storage: IStorage) {
    this.editingStorage.set(storage);
    this.updateStorageLogicData.updateStorageInit(storage);
    this.setModal('updateStorage', true);
  }

  protected openDeleteStorageModal(storage: IStorage) {
    this.editingStorage.set(storage);
    this.setModal('deleteStorage', true);
  }

  protected closeModal(key: ModalKey) {
    this.setModal(key, false);
  }

  private setModal(key: ModalKey, opened: boolean) {
    this.modals.update((modals) => ({ ...modals, [key]: opened }));
  }
}
