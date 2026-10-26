import { Component, computed, inject, signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsModal } from '@/components/utils/Modal';
import { type TableAction, UtilsTable } from '@/components/utils/Table';
import { CreateUnitLogicComponent, injectCreateUnitLogicData } from '@/resources/unit/logics/CreateUnit';
import { DeleteUnitLogicComponent, injectDeleteUnitLogicData } from '@/resources/unit/logics/DeleteUnit';
import { injectUpdateUnitLogicData, UpdateUnitLogicComponent } from '@/resources/unit/logics/UpdateUnit';
import type { IUnit } from '@/resources/unit/models/Unit';
import { getUnitsService } from '@/resources/unit/services/getUnits';
import { I18n } from '@/libs/i18n';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';

type ModalKey = 'createUnit' | 'updateUnit' | 'deleteUnit';

@Component({
  selector: 'app-units-page',
  imports: [
    FormButton,
    PageHeader,
    UtilsCard,
    UtilsModal,
    UtilsTable,
    TranslatePipe,
    CreateUnitLogicComponent,
    UpdateUnitLogicComponent,
    DeleteUnitLogicComponent,
  ],
  host: { class: 'flex flex-col flex-1 gap-6 p-4 sm:p-6' },
  template: `
    <app-page-header
      [title]="'units.page.title' | t"
      [subtitle]="'units.page.subtitle' | t"
    >
      <button
        appButton
        leftIcon="lucidePlus"
        (click)="openCreateUnitModal()"
      >
        {{ 'inventory.actions.newUnit' | t }}
      </button>
    </app-page-header>

    <section appCard>
      <app-utils-table
        [rows]="units()"
        [rowKey]="rowKey"
        [loading]="unitsQuery.isFetching()"
        [emptyText]="'units.table.empty' | t"
        [columns]="{
          name: 'units.table.columns.name' | t,
          abbreviation: 'units.table.columns.abbreviation' | t,
        }"
        [actions]="actions()"
      />
    </section>

    <app-utils-modal
      size="sm"
      [opened]="modals().createUnit"
      [title]="'inventory.modals.createUnit' | t"
      (closed)="closeModal('createUnit')"
    >
      <ng-template>
        <app-create-unit-logic
          [logicData]="createUnitLogicData"
          (cancel)="closeModal('createUnit')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().updateUnit"
      [title]="'inventory.modals.updateUnit' | t"
      (closed)="closeModal('updateUnit')"
    >
      <ng-template>
        <app-update-unit-logic
          [logicData]="updateUnitLogicData"
          (cancel)="closeModal('updateUnit')"
        />
      </ng-template>
    </app-utils-modal>

    <app-utils-modal
      size="sm"
      [opened]="modals().deleteUnit"
      [title]="'inventory.modals.deleteUnit' | t"
      (closed)="closeModal('deleteUnit')"
    >
      <ng-template>
        <app-delete-unit-logic
          [logicData]="deleteUnitLogicData"
          [unitName]="editingUnit()?.name ?? ''"
          (cancel)="closeModal('deleteUnit')"
        />
      </ng-template>
    </app-utils-modal>
  `,
})
export class UnitsPage {
  private readonly i18n = inject(I18n);

  protected readonly modals = signal<Record<ModalKey, boolean>>({ createUnit: false, updateUnit: false, deleteUnit: false });
  protected readonly editingUnit = signal<IUnit | null>(null);

  protected readonly unitsQuery = createQuery({ queryFn: () => getUnitsService() });

  protected readonly units = computed(() => this.unitsQuery.data()?.data ?? []);

  protected readonly rowKey = ({ item }: { item: IUnit }) => item.id;

  protected readonly actions = computed<TableAction<IUnit>[]>(() => [
    {
      icon: 'lucidePencil',
      label: this.i18n.t('common.actions.edit'),
      onClick: ({ item }) => this.openUpdateUnitModal(item),
    },
    {
      icon: 'lucideTrash2',
      label: this.i18n.t('common.actions.delete'),
      variant: 'destructive',
      onClick: ({ item }) => this.openDeleteUnitModal(item),
    },
  ]);

  protected readonly createUnitLogicData = injectCreateUnitLogicData({
    onSuccess: () => {
      this.unitsQuery.refetch();
      this.closeModal('createUnit');
    },
  });

  protected readonly updateUnitLogicData = injectUpdateUnitLogicData({
    editingUnitId: computed(() => this.editingUnit()?.id),
    onSuccess: () => {
      this.unitsQuery.refetch();
      this.closeModal('updateUnit');
    },
  });

  protected readonly deleteUnitLogicData = injectDeleteUnitLogicData({
    editingUnitId: computed(() => this.editingUnit()?.id),
    onSuccess: () => {
      this.unitsQuery.refetch();
      this.closeModal('deleteUnit');
    },
  });

  protected openCreateUnitModal() {
    this.createUnitLogicData.createUnitReset();
    this.setModal('createUnit', true);
  }

  protected openUpdateUnitModal(unit: IUnit) {
    this.editingUnit.set(unit);
    this.updateUnitLogicData.updateUnitInit(unit);
    this.setModal('updateUnit', true);
  }

  protected openDeleteUnitModal(unit: IUnit) {
    this.editingUnit.set(unit);
    this.setModal('deleteUnit', true);
  }

  protected closeModal(key: ModalKey) {
    this.setModal(key, false);
  }

  private setModal(key: ModalKey, opened: boolean) {
    this.modals.update((modals) => ({ ...modals, [key]: opened }));
  }
}
