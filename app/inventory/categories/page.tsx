'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Modal, Badge } from '@mantine/core';
import { UtilsCard } from '@/src/components/utils/Card';
import { UtilsTable } from '@/src/components/utils/Table';
import { FormButton } from '@/src/components/form/Button';
import { getItemCategoriesService, GET_ITEM_CATEGORIES_KEY } from '@/src/resources/item-category/services/getItemCategories';
import { useCreateItemCategoryLogicData, CreateItemCategoryLogicComponent } from '@/src/resources/item-category/logics/CreateItemCategory';
import { useUpdateItemCategoryLogicData, UpdateItemCategoryLogicComponent } from '@/src/resources/item-category/logics/UpdateItemCategory';
import { useDeleteItemCategoryLogicData, DeleteItemCategoryLogicComponent } from '@/src/resources/item-category/logics/DeleteItemCategory';
import type { IItemCategory } from '@/src/resources/item-category/models/ItemCategory';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IItemCategory | null>(null);

  const {
    data: categoriesData,
    isFetching: categoriesIsFetching,
    refetch: categoriesRefetch,
  } = useQuery({
    queryKey: GET_ITEM_CATEGORIES_KEY,
    queryFn: ({ signal }) => getItemCategoriesService({ signal }),
  });

  const categories = useMemo(() => categoriesData?.data ?? [], [categoriesData]);

  const createCategoryLogicData = useCreateItemCategoryLogicData({
    onSuccess: () => {
      categoriesRefetch();
      setCreateModalOpen(false);
    },
  });

  const updateCategoryLogicData = useUpdateItemCategoryLogicData({
    editingCategoryId: String(editingCategory?.id ?? ''),
    onSuccess: () => {
      categoriesRefetch();
      setUpdateModalOpen(false);
    },
  });

  const deleteCategoryLogicData = useDeleteItemCategoryLogicData({
    editingCategoryId: String(editingCategory?.id ?? ''),
    onSuccess: () => {
      categoriesRefetch();
      setDeleteModalOpen(false);
    },
  });

  function openCreate() {
    createCategoryLogicData.createItemCategoryReset();
    setCreateModalOpen(true);
  }

  function openUpdate(category: IItemCategory) {
    setEditingCategory(category);
    updateCategoryLogicData.updateItemCategoryValidatedFormState.setState(category as any);
    setUpdateModalOpen(true);
  }

  function openDelete(category: IItemCategory) {
    setEditingCategory(category);
    setDeleteModalOpen(true);
  }

  return (
    <main className="flex flex-col flex-1 gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('categories.page.title')}
          </h1>

          <span className="text-sm text-gray-500">
            {t('categories.page.subtitle')}
          </span>
        </div>

        <FormButton
          color="primary"
          leftIcon="lucide:plus"
          onClick={openCreate}
        >
          {t('inventory.actions.newCategory')}
        </FormButton>
      </div>

      <UtilsCard>
        <UtilsTable
          rows={categories}
          rowKey={({ item }) => String(item.id)}
          loading={categoriesIsFetching}
          emptyText={t('categories.table.empty')}
          columns={{
            name: t('categories.table.columns.name'),
            color_hex: t('categories.table.columns.color'),
          }}
          renderCells={{
            color_hex: ({ item }) => (
              <Badge
                size="sm"
                style={{ backgroundColor: item.color_hex, color: '#fff' }}
              >
                {item.color_hex}
              </Badge>
            ),
          }}
          actions={[
            {
              icon: 'lucide:pencil',
              label: t('categories.actions.edit'),
              variant: 'subtle',
              onClick: ({ item }) => openUpdate(item),
            },
            {
              icon: 'lucide:trash-2',
              label: t('categories.actions.delete'),
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
        title={t('inventory.modals.createCategory')}
        size="sm"
        centered
      >
        <CreateItemCategoryLogicComponent
          logicData={createCategoryLogicData}
          onCancel={() => setCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title={t('inventory.modals.updateCategory')}
        size="sm"
        centered
      >
        <UpdateItemCategoryLogicComponent
          logicData={updateCategoryLogicData}
          onCancel={() => setUpdateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('inventory.modals.deleteCategory')}
        size="sm"
        centered
      >
        {editingCategory && (
          <DeleteItemCategoryLogicComponent
            logicData={deleteCategoryLogicData}
            categoryName={editingCategory.name}
            onCancel={() => setDeleteModalOpen(false)}
          />
        )}
      </Modal>
    </main>
  );
}
