import { describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/inventory-items/route';
import { PATCH } from '@/app/api/inventory-items/[id]/route';
import { POST as BUILD } from '@/app/api/inventory-items/[id]/build/route';
import { db } from '@/libs/db';
import { inventoryItemHasCategory, inventoryItemHasComponent } from '@/db/schema';
import { factories, failNextDbCall, jsonRequest, params, readJson } from '../support/api';

function list(query = '') {
  return GET(new Request(`http://localhost/api/inventory-items${query}`));
}

describe('GET /api/inventory-items', () => {
  it('returns an empty first page', async () => {
    const { status, body } = await readJson(await list());

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

    const { body } = await readJson(await list());
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

    const { body } = await readJson(await list('?search=parafuso'));

    expect(body.data.items.map((i: { name: string }) => i.name)).toEqual(['Parafuso Sextavado']);
    expect(body.data.meta.total).toBe(1);
  });

  it('paginates and clamps page/per_page', async () => {
    const unit = await factories.unit();
    for (const name of ['A', 'B', 'C']) await factories.item({ name, unit_id: unit.id });

    const page2 = (await readJson(await list('?page=2&per_page=2'))).body.data;
    expect(page2.items.map((i: { name: string }) => i.name)).toEqual(['C']);
    expect(page2.meta).toEqual({ page: 2, per_page: 2, total: 3, last_page: 2 });

    const clamped = (await readJson(await list('?page=0&per_page=500'))).body.data.meta;
    expect(clamped).toMatchObject({ page: 1, per_page: 100 });

    const minimum = (await readJson(await list('?per_page=0'))).body.data.meta;
    expect(minimum.per_page).toBe(1);
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('select');

    const { status, body } = await readJson(await list());

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error fetching items.');
  });
});

describe('POST /api/inventory-items', () => {
  it('creates a simple item with default quantity', async () => {
    const unit = await factories.unit();

    const { status, body } = await readJson(await POST(jsonRequest('/api/inventory-items', 'POST', { name: 'Prego', unit_id: String(unit.id) })));

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ name: 'Prego', quantity: '0.0000', unit_id: unit.id, storage_id: null });
    expect(body.message['pt-br']).toBe('Item criado com sucesso.');
  });

  it('creates an item with storage, categories and components', async () => {
    const unit = await factories.unit();
    const storage = await factories.storage();
    const category = await factories.category();
    const component = await factories.item({ name: 'Tábua', unit_id: unit.id });

    const { status, body } = await readJson(await POST(jsonRequest('/api/inventory-items', 'POST', {
      name: 'Mesa',
      unit_id: unit.id,
      storage_id: String(storage.id),
      quantity: 3,
      category_ids: [String(category.id)],
      components: [{ id: String(component.id), quantity_required: 4 }],
    })));

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ name: 'Mesa', quantity: '3.0000', storage_id: storage.id });

    const categories = await db.select().from(inventoryItemHasCategory);
    const components = await db.select().from(inventoryItemHasComponent);
    expect(categories).toMatchObject([{ inventory_item_id: body.data.id, item_category_id: category.id }]);
    expect(components).toMatchObject([{ inventory_item_id: body.data.id, component_inventory_item_id: component.id, quantity_required: '4.0000' }]);
  });

  it.each([[{ name: 'x' }], [{ unit_id: 1 }]])('rejects %j with 422', async (payload) => {
    const { status, body } = await readJson(await POST(jsonRequest('/api/inventory-items', 'POST', payload)));

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Nome e unidade são obrigatórios.');
  });

  it('returns 500 when the unit does not exist (FK violation)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { status, body } = await readJson(await POST(jsonRequest('/api/inventory-items', 'POST', { name: 'x', unit_id: 999 })));

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error creating item.');
  });
});

describe('PATCH /api/inventory-items/:id', () => {
  async function seed(quantity = '10') {
    const unit = await factories.unit();
    return factories.item({ name: 'Cabo', quantity, unit_id: unit.id });
  }

  function patch(id: number | string, body: unknown) {
    return PATCH(jsonRequest(`/api/inventory-items/${id}`, 'PATCH', body), params({ id: String(id) }));
  }

  it('sets an absolute quantity', async () => {
    const item = await seed();

    const { status, body } = await readJson(await patch(item.id, { quantity: 7.5 }));

    expect(status).toBe(200);
    expect(body.data.quantity).toBe('7.5000');
    expect(body.message['pt-br']).toBe('Quantidade atualizada com sucesso.');
  });

  it('adds and subtracts atomically', async () => {
    const item = await seed('10');

    expect((await readJson(await patch(item.id, { quantity_add: 5 }))).body.data.quantity).toBe('15.0000');
    expect((await readJson(await patch(item.id, { quantity_subtract: 3 }))).body.data.quantity).toBe('12.0000');
  });

  it('renames an item trimming whitespace', async () => {
    const item = await seed();

    const { body } = await readJson(await patch(item.id, { name: '  Cabo USB  ' }));

    expect(body.data.name).toBe('Cabo USB');
    expect(body.message['pt-br']).toBe('Nome atualizado com sucesso.');
  });

  it('rejects a blank name', async () => {
    const item = await seed();

    const { status, body } = await readJson(await patch(item.id, { name: '   ' }));

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Nome é obrigatório.');
  });

  it('sets and clears the storage', async () => {
    const item = await seed();
    const storage = await factories.storage();

    const set = await readJson(await patch(item.id, { storage_id: storage.id }));
    expect(set.body.data.storage_id).toBe(storage.id);
    expect(set.body.message['pt-br']).toBe('Armazenamento atualizado com sucesso.');

    const cleared = await readJson(await patch(item.id, { storage_id: null }));
    expect(cleared.body.data.storage_id).toBeNull();
  });

  it('rejects a payload without updatable fields', async () => {
    const { status, body } = await readJson(await patch(1, { foo: 'bar', quantity: null }));

    expect(status).toBe(422);
    expect(body.message['en-us']).toBe('No field to update was provided.');
  });

  it('returns 404 for an unknown item', async () => {
    const { status, body } = await readJson(await patch(404, { quantity: 1 }));

    expect(status).toBe(404);
    expect(body.message['pt-br']).toBe('Item não encontrado.');
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('update');

    const { status, body } = await readJson(await patch(1, { quantity: 1 }));

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
    return { chair, woodItem, nailItem };
  }

  function build(id: number | string, body: unknown) {
    return BUILD(jsonRequest(`/api/inventory-items/${id}/build`, 'POST', body), params({ id: String(id) }));
  }

  async function quantities() {
    const { body } = await readJson(await list());
    return Object.fromEntries(body.data.items.map((i: { name: string; quantity: string }) => [i.name, i.quantity]));
  }

  it('consumes components and increments the built item', async () => {
    const { chair } = await seedRecipe();

    const { status, body } = await readJson(await build(chair.id, { quantity: 2 }));

    expect(status).toBe(200);
    expect(body.data.quantity).toBe('3.0000');
    expect(body.message['pt-br']).toBe('2 unidade(s) construída(s) com sucesso.');
    expect(await quantities()).toEqual({ Cadeira: '3.0000', Madeira: '6.0000', Prego: '4.0000' });
  });

  it('defaults to building one unit', async () => {
    const { chair } = await seedRecipe();

    const { body } = await readJson(await build(chair.id, {}));

    expect(body.data.quantity).toBe('2.0000');
  });

  it.each([0, -1])('rejects quantity %s', async (quantity) => {
    const { status, body } = await readJson(await build(1, { quantity }));

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Quantidade deve ser maior que zero.');
  });

  it('rejects items without components', async () => {
    const unit = await factories.unit();
    const item = await factories.item({ unit_id: unit.id });

    const { status, body } = await readJson(await build(item.id, { quantity: 1 }));

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Este item não possui componentes cadastrados.');
  });

  it('rejects when stock is insufficient and leaves quantities untouched', async () => {
    const { chair } = await seedRecipe({ nails: '10' });

    const { status, body } = await readJson(await build(chair.id, { quantity: 2 }));

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Estoque insuficiente de "Prego". Necessário: 16, Disponível: 10.');
    expect(await quantities()).toEqual({ Cadeira: '1.0000', Madeira: '10.0000', Prego: '10.0000' });
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('select');

    const { status, body } = await readJson(await build(1, { quantity: 1 }));

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error building item.');
  });
});
