'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Modal } from '@mantine/core';
import { UtilsCard } from '@/src/components/utils/Card';
import { UtilsTable } from '@/src/components/utils/Table';
import { FormButton } from '@/src/components/form/Button';
import { getStoragesService, GET_STORAGES_KEY } from '@/src/resources/storage/services/getStorages';
import { useCreateStorageLogicData, CreateStorageLogicComponent } from '@/src/resources/storage/logics/CreateStorage';
import { useUpdateStorageLogicData, UpdateStorageLogicComponent } from '@/src/resources/storage/logics/UpdateStorage';
import { useDeleteStorageLogicData, DeleteStorageLogicComponent } from '@/src/resources/storage/logics/DeleteStorage';
import type { IStorage } from '@/src/resources/storage/models/Storage';

export default function StoragesPage() {
  const { t } = useTranslation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingStorage, setEditingStorage] = useState<IStorage | null>(null);

  const {
    data: storagesData,
    isFetching: storagesIsFetching,
    refetch: storagesRefetch,
  } = useQuery({
    queryKey: GET_STORAGES_KEY,
    queryFn: ({ signal }) => getStoragesService({ signal }),
  });

  const storagesList = useMemo(() => storagesData?.data ?? [], [storagesData]);

  const createStorageLogicData = useCreateStorageLogicData({
    onSuccess: () => {
      storagesRefetch();
      setCreateModalOpen(false);
    },
  });

  const updateStorageLogicData = useUpdateStorageLogicData({
    editingStorageId: String(editingStorage?.id ?? ''),
    onSuccess: () => {
      storagesRefetch();
      setUpdateModalOpen(false);
    },
  });

  const deleteStorageLogicData = useDeleteStorageLogicData({
    editingStorageId: String(editingStorage?.id ?? ''),
    onSuccess: () => {
      storagesRefetch();
      setDeleteModalOpen(false);
    },
  });

  function openCreate() {
    createStorageLogicData.createStorageReset();
    setCreateModalOpen(true);
  }

  function openUpdate(storage: IStorage) {
    setEditingStorage(storage);
    updateStorageLogicData.updateStorageValidatedFormState.setState(storage as any);
    setUpdateModalOpen(true);
  }

  function openDelete(storage: IStorage) {
    setEditingStorage(storage);
    setDeleteModalOpen(true);
  }

  return (
    <main className="flex flex-col flex-1 gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('storages.page.title')}
          </h1>

          <span className="text-sm text-gray-500">
            {t('storages.page.subtitle')}
          </span>
        </div>

        <FormButton
          color="primary"
          leftIcon="lucide:plus"
          onClick={openCreate}
        >
          {t('storages.actions.new')}
        </FormButton>
      </div>

      <UtilsCard>
        <UtilsTable
          rows={storagesList}
          rowKey={({ item }) => String(item.id)}
          loading={storagesIsFetching}
          emptyText={t('storages.table.empty')}
          columns={{
            name: t('storages.table.columns.name'),
            description: t('storages.table.columns.description'),
          }}
          actions={[
            {
              icon: 'lucide:pencil',
              label: t('storages.actions.edit'),
              variant: 'subtle',
              onClick: ({ item }) => openUpdate(item),
            },
            {
              icon: 'lucide:trash-2',
              label: t('storages.actions.delete'),
              variant: 'subtle',
              color: 'red',
              onClick: ({ item }) => openDelete(item),
            },
          ]}
        />
      </UtilsCard>

      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('storages.modals.create')}
        size="sm"
        centered
      >
        <CreateStorageLogicComponent
          logicData={createStorageLogicData}
          onCancel={() => setCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title={t('storages.modals.update')}
        size="sm"
        centered
      >
        <UpdateStorageLogicComponent
          logicData={updateStorageLogicData}
          onCancel={() => setUpdateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('storages.modals.delete')}
        size="sm"
        centered
      >
        {editingStorage && (
          <DeleteStorageLogicComponent
            logicData={deleteStorageLogicData}
            storageName={editingStorage.name}
            onCancel={() => setDeleteModalOpen(false)}
          />
        )}
      </Modal>
    </main>
  );
}
