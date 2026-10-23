import { describe, expect, it } from 'vitest';
import { mockFetch, ok } from '../../support/fetch';
import { getUnitsService, GET_UNITS_KEY } from '@/resources/unit/services/getUnits';
import { createUnitService } from '@/resources/unit/services/createUnit';
import { updateUnitService } from '@/resources/unit/services/updateUnit';
import { deleteUnitService } from '@/resources/unit/services/deleteUnit';
import { getItemCategoriesService, GET_ITEM_CATEGORIES_KEY } from '@/resources/item-category/services/getItemCategories';
import { createItemCategoryService } from '@/resources/item-category/services/createItemCategory';
import { updateItemCategoryService } from '@/resources/item-category/services/updateItemCategory';
import { deleteItemCategoryService } from '@/resources/item-category/services/deleteItemCategory';
import { getStoragesService, GET_STORAGES_KEY } from '@/resources/storage/services/getStorages';
import { createStorageService } from '@/resources/storage/services/createStorage';
import { updateStorageService } from '@/resources/storage/services/updateStorage';
import { deleteStorageService } from '@/resources/storage/services/deleteStorage';
import { getInventoryItemsService, GET_INVENTORY_ITEMS_KEY } from '@/resources/inventory-item/services/getInventoryItems';
import { createInventoryItemService } from '@/resources/inventory-item/services/createInventoryItem';
import { updateInventoryItemNameService } from '@/resources/inventory-item/services/updateInventoryItemName';
import { updateInventoryItemQuantityService } from '@/resources/inventory-item/services/updateInventoryItemQuantity';
import { updateInventoryItemStorageService } from '@/resources/inventory-item/services/updateInventoryItemStorage';
import { buildInventoryItemService } from '@/resources/inventory-item/services/buildInventoryItem';

describe('query keys', () => {
  it('are stable arrays', () => {
    expect(GET_UNITS_KEY).toEqual(['get-units']);
    expect(GET_ITEM_CATEGORIES_KEY).toEqual(['get-item-categories']);
    expect(GET_STORAGES_KEY).toEqual(['get-storages']);
    expect(GET_INVENTORY_ITEMS_KEY).toEqual(['get-inventory-items']);
  });
});

describe.each([
  {
    name: 'unit',
    base: '/api/units',
    get: getUnitsService,
    create: createUnitService,
    update: updateUnitService,
    remove: deleteUnitService,
    body: { name: 'Metro', abbreviation: 'm' },
  },
  {
    name: 'item-category',
    base: '/api/item-categories',
    get: getItemCategoriesService,
    create: createItemCategoryService,
    update: updateItemCategoryService,
    remove: deleteItemCategoryService,
    body: { name: 'Cat', color_hex: '#000000' },
  },
  {
    name: 'storage',
    base: '/api/storages',
    get: getStoragesService,
    create: createStorageService,
    update: updateStorageService,
    remove: deleteStorageService,
    body: { name: 'Depósito', description: 'x' },
  },
])('$name services', ({ base, get, create, update, remove, body }) => {
  it('hit the expected endpoints', async () => {
    const api = mockFetch({
      [`GET ${base}`]: ok([]),
      [`POST ${base}`]: ok({}),
      [`PUT ${base}/7`]: ok({}),
      [`DELETE ${base}/7`]: ok(null),
    });

    await get({});
    await create({ body } as never);
    await update({ id: '7', body } as never);
    await remove({ id: '7' });

    expect(api.calls(`GET ${base}`)).toHaveLength(1);
    expect(api.calls(`POST ${base}`)[0].body).toEqual(body);
    expect(api.calls(`PUT ${base}/7`)[0].body).toEqual(body);
    expect(api.calls(`DELETE ${base}/7`)).toHaveLength(1);
  });
});

describe('inventory item services', () => {
  it('builds the list query string only with provided params', async () => {
    const api = mockFetch({ 'GET /api/inventory-items': ok({ items: [], meta: {} }) });

    await getInventoryItemsService({});
    await getInventoryItemsService({ query: { search: 'pa', page: 2, per_page: 15 } });

    const [plain, filtered] = api.calls('GET /api/inventory-items');
    expect(plain.search.toString()).toBe('');
    expect(Object.fromEntries(filtered.search)).toEqual({ search: 'pa', page: '2', per_page: '15' });
    expect(api.fn.mock.calls[0][0]).toBe('/api/inventory-items');
  });

  it('create / patch / build endpoints', async () => {
    const api = mockFetch({
      'POST /api/inventory-items': ok({}),
      'PATCH /api/inventory-items/3': ok({}),
      'POST /api/inventory-items/3/build': ok({}),
    });

    await createInventoryItemService({ body: { name: 'x', unit_id: '1' } });
    await updateInventoryItemNameService({ itemId: '3', body: { name: 'y' } });
    await updateInventoryItemQuantityService({ itemId: '3', body: { quantity: 4 } });
    await updateInventoryItemStorageService({ itemId: '3', body: { storage_id: null } });
    await buildInventoryItemService({ itemId: '3', body: { quantity: 2 } });

    expect(api.calls('POST /api/inventory-items')[0].body).toEqual({ name: 'x', unit_id: '1' });
    expect(api.calls('PATCH /api/inventory-items/3').map(c => c.body)).toEqual([{ name: 'y' }, { quantity: 4 }, { storage_id: null }]);
    expect(api.calls('POST /api/inventory-items/3/build')[0].body).toEqual({ quantity: 2 });
  });
});
