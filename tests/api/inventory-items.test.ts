import { describe, expect, it } from 'vitest';
import { inventoryItemHasCategory, inventoryItemHasComponent } from '../../db/schema';
import { db } from '../../src/server/db';
import { factories } from './support/factories';
import { api, failNextDbCall } from './support/http';

function list(query = '') {
  return api('GET', `/api/inventory-items${query}`);
}

describe('GET /api/inventory-items', () => {
  it('returns an empty first page', async () => {
    const { status, body } = await list();

    expect(status).toBe(200);
    expect(body.data).toEqual({ items: [], meta: { page: 1, per_page: 15, total: 0, last_page: 1 } });
  });

  it('returns items with nested unit, storage, categories and components', async () => {
    const unit = await factories.unit({ name: 'Unidade', abbreviation: 'un' });
    const storage = await factories.storage({ name: 'Depósito' });
    const category = await factories.category({ name: 'Móveis', color_hex: '#ff0000' });
    const wood = await factories.item({ name: 'Madeira', quantity: '10', unit_id: unit.id });
    const chair = await factories.item({ name: 'Cadeira', quantity: '2', unit_id: unit.id, storage_id: storage.id });
    await factories.linkCategory(chair.id, category.id);
    await factories.linkComponent(chair.id, wood.id, '2.5');

    const { body } = await list();
    const [first, second] = body.data.items;

    expect(body.data.meta.total).toBe(2);
    expect(first).toEqual({
      id: chair.id,
      name: 'Cadeira',
      quantity: '2.0000',
      created_at: null,
      updated_at: null,
      unit: { id: unit.id, name: 'Unidade', abbreviation: 'un' },
      storage: { id: storage.id, name: 'Depósito' },
      categories: [{ id: category.id, name: 'Móveis', color_hex: '#ff0000' }],
      components: [{ id: wood.id, name: 'Madeira', quantity_required: '2.5000', current_quantity: '10.0000' }],
    });
    expect(second).toMatchObject({ name: 'Madeira', storage: null, categories: [], components: [] });
  });

  it('filters by name case-insensitively', async () => {
    const unit = await factories.unit();
    await factories.item({ name: 'Parafuso Sextavado', unit_id: unit.id });
    await factories.item({ name: 'Porca', unit_id: unit.id });

    const { body } = await list('?search=parafuso');

    expect(body.data.items.map((item: { name: string }) => item.name)).toEqual(['Parafuso Sextavado']);
    expect(body.data.meta.total).toBe(1);
  });

  it('paginates and clamps page/per_page', async () => {
    const unit = await factories.unit();
    for (const name of ['A', 'B', 'C']) await factories.item({ name, unit_id: unit.id });

    const page2 = (await list('?page=2&per_page=2')).body.data;
    expect(page2.items.map((item: { name: string }) => item.name)).toEqual(['C']);
    expect(page2.meta).toEqual({ page: 2, per_page: 2, total: 3, last_page: 2 });

    expect((await list('?page=0&per_page=500')).body.data.meta).toMatchObject({ page: 1, per_page: 100 });
    expect((await list('?page=abc&per_page=-5')).body.data.meta).toMatchObject({ page: 1, per_page: 1 });
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('select');

    const { status, body } = await list();

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error fetching items.');
  });
});

describe('POST /api/inventory-items', () => {
  it('creates a simple item with default quantity', async () => {
    const unit = await factories.unit();

    const { status, body } = await api('POST', '/api/inventory-items', { name: 'Prego', unit_id: String(unit.id) });

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ name: 'Prego', quantity: '0.0000', unit_id: unit.id, storage_id: null });
    expect(body.message['pt-br']).toBe('Item criado com sucesso.');
  });

  it('creates an item with storage, categories and components', async () => {
    const unit = await factories.unit();
    const storage = await factories.storage();
    const category = await factories.category();
    const component = await factories.item({ name: 'Tábua', unit_id: unit.id });

    const { status, body } = await api('POST', '/api/inventory-items', {
      name: 'Mesa',
      unit_id: unit.id,
      storage_id: storage.id,
      quantity: 3,
      category_ids: [category.id, category.id],
      components: [{ id: component.id, quantity_required: 4 }],
    });

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ name: 'Mesa', storage_id: storage.id });

    expect(await db.select().from(inventoryItemHasCategory)).toMatchObject([{ inventory_item_id: body.data.id, item_category_id: category.id }]);
    expect(await db.select().from(inventoryItemHasComponent)).toMatchObject([
      { inventory_item_id: body.data.id, component_inventory_item_id: component.id, quantity_required: '4.0000' },
    ]);
  });

  it.each([[{ name: 'x' }], [{ unit_id: 1 }], [{ name: '  ', unit_id: 1 }]])('rejects %j with 422', async (payload) => {
    const { status, body } = await api('POST', '/api/inventory-items', payload);

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Nome e unidade são obrigatórios.');
  });

  it.each([-1, 'abc'])('rejects quantity %j', async (quantity) => {
    const unit = await factories.unit();

    const { status, body } = await api('POST', '/api/inventory-items', { name: 'x', unit_id: unit.id, quantity });

    expect(status).toBe(422);
    expect(body.message['en-us']).toBe('Invalid quantity.');
  });

  it('rejects components without a positive quantity', async () => {
    const unit = await factories.unit();
    const component = await factories.item({ unit_id: unit.id });

    const { status } = await api('POST', '/api/inventory-items', { name: 'x', unit_id: unit.id, components: [{ id: component.id, quantity_required: 0 }] });

    expect(status).toBe(422);
  });

  it('returns 422 when a reference does not exist and creates nothing (transaction)', async () => {
    const unit = await factories.unit();

    const { status, body } = await api('POST', '/api/inventory-items', { name: 'x', unit_id: unit.id, category_ids: [999] });

    expect(status).toBe(422);
    expect(body.message['en-us']).toBe('The given unit, storage, category or component does not exist.');
    expect((await list()).body.data.items).toHaveLength(0);
  });
});

describe('PATCH /api/inventory-items/:id', () => {
  async function seed(quantity = '10') {
    const unit = await factories.unit();
    return factories.item({ name: 'Cabo', quantity, unit_id: unit.id });
  }

  function patch(id: number | string, body: unknown) {
    return api('PATCH', `/api/inventory-items/${id}`, body);
  }

  it('sets an absolute quantity', async () => {
    const item = await seed();

    const { status, body } = await patch(item.id, { quantity: 7.5 });

    expect(status).toBe(200);
    expect(body.data.quantity).toBe('7.5000');
    expect(body.message['pt-br']).toBe('Quantidade atualizada com sucesso.');
  });

  it('adds and subtracts atomically', async () => {
    const item = await seed('10');

    expect((await patch(item.id, { quantity_add: 5 })).body.data.quantity).toBe('15.0000');
    expect((await patch(item.id, { quantity_subtract: 3 })).body.data.quantity).toBe('12.0000');
  });

  it.each([[{ quantity: -1 }], [{ quantity: 'x' }], [{ quantity_add: 'x' }]])('rejects invalid quantity %j', async (payload) => {
    const item = await seed();

    expect((await patch(item.id, payload)).status).toBe(422);
  });

  it('renames an item trimming whitespace', async () => {
    const item = await seed();

    const { body } = await patch(item.id, { name: '  Cabo USB  ' });

    expect(body.data.name).toBe('Cabo USB');
    expect(body.message['pt-br']).toBe('Nome atualizado com sucesso.');
  });

  it('rejects a blank name', async () => {
    const item = await seed();

    const { status, body } = await patch(item.id, { name: '   ' });

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Nome é obrigatório.');
  });

  it('sets and clears the storage', async () => {
    const item = await seed();
    const storage = await factories.storage();

    const set = await patch(item.id, { storage_id: storage.id });
    expect(set.body.data.storage_id).toBe(storage.id);
    expect(set.body.message['pt-br']).toBe('Armazenamento atualizado com sucesso.');

    expect((await patch(item.id, { storage_id: null })).body.data.storage_id).toBeNull();
  });

  it('returns 422 for a storage that does not exist', async () => {
    const item = await seed();

    expect((await patch(item.id, { storage_id: 999 })).status).toBe(422);
  });

  it('rejects a payload without updatable fields', async () => {
    const { status, body } = await patch(1, { foo: 'bar', quantity: null });

    expect(status).toBe(422);
    expect(body.message['en-us']).toBe('No field to update was provided.');
  });

  it('returns 404 for an unknown item', async () => {
    const { status, body } = await patch(404, { quantity: 1 });

    expect(status).toBe(404);
    expect(body.message['pt-br']).toBe('Item não encontrado.');
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('update');

    const { status, body } = await patch(1, { quantity: 1 });

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error updating the item.');
  });
});

describe('POST /api/inventory-items/:id/build', () => {
  async function seedRecipe({ wood = '10', nails = '20' } = {}) {
    const unit = await factories.unit();
    const woodItem = await factories.item({ name: 'Madeira', quantity: wood, unit_id: unit.id });
    const nailItem = await factories.item({ name: 'Prego', quantity: nails, unit_id: unit.id });
    const chair = await factories.item({ name: 'Cadeira', quantity: '1', unit_id: unit.id });
    await factories.linkComponent(chair.id, woodItem.id, '2');
    await factories.linkComponent(chair.id, nailItem.id, '8');
    return { chair };
  }

  function build(id: number | string, body: unknown) {
    return api('POST', `/api/inventory-items/${id}/build`, body);
  }

  async function quantities() {
    const { body } = await list();
    return Object.fromEntries(body.data.items.map((item: { name: string; quantity: string }) => [item.name, item.quantity]));
  }

  it('consumes components and increments the built item', async () => {
    const { chair } = await seedRecipe();

    const { status, body } = await build(chair.id, { quantity: 2 });

    expect(status).toBe(200);
    expect(body.data.quantity).toBe('3.0000');
    expect(body.message['pt-br']).toBe('2 unidade(s) construída(s) com sucesso.');
    expect(await quantities()).toEqual({ Cadeira: '3.0000', Madeira: '6.0000', Prego: '4.0000' });
  });

  it('defaults to building one unit', async () => {
    const { chair } = await seedRecipe();

    expect((await build(chair.id, {})).body.data.quantity).toBe('2.0000');
  });

  it.each([0, -1, 'x'])('rejects quantity %s', async (quantity) => {
    const { status, body } = await build(1, { quantity });

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Quantidade deve ser maior que zero.');
  });

  it('rejects items without components', async () => {
    const unit = await factories.unit();
    const item = await factories.item({ unit_id: unit.id });

    const { status, body } = await build(item.id, { quantity: 1 });

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Este item não possui componentes cadastrados.');
  });

  it('rejects when stock is insufficient and leaves quantities untouched (rollback)', async () => {
    const { chair } = await seedRecipe({ nails: '10' });

    const { status, body } = await build(chair.id, { quantity: 2 });

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Estoque insuficiente de "Prego". Necessário: 16, Disponível: 10.');
    expect(await quantities()).toEqual({ Cadeira: '1.0000', Madeira: '10.0000', Prego: '10.0000' });
  });

  it('never consumes the same stock twice under concurrent builds', async () => {
    const { chair } = await seedRecipe({ wood: '2', nails: '8' });

    const results = await Promise.all([build(chair.id, { quantity: 1 }), build(chair.id, { quantity: 1 })]);

    expect(results.map((result) => result.status).sort()).toEqual([200, 422]);
    expect(await quantities()).toEqual({ Cadeira: '2.0000', Madeira: '0.0000', Prego: '0.0000' });
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('transaction');

    const { status, body } = await build(1, { quantity: 1 });

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error building item.');
  });
});
