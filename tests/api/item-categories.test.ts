import { describe, expect, it } from 'vitest';
import { factories } from './support/factories';
import { api, failNextDbCall } from './support/http';

describe('GET /api/item-categories', () => {
  it('lists categories ordered by name', async () => {
    await factories.category({ name: 'Peças' });
    await factories.category({ name: 'Embalagens' });

    const { status, body } = await api('GET', '/api/item-categories');

    expect(status).toBe(200);
    expect(body.data.map((category: { name: string }) => category.name)).toEqual(['Embalagens', 'Peças']);
    expect(Object.keys(body.data[0])).toEqual(['id', 'name', 'color_hex', 'created_at', 'updated_at']);
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('select');

    const { status, body } = await api('GET', '/api/item-categories');

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error fetching categories.');
  });
});

describe('POST /api/item-categories', () => {
  it('creates a category', async () => {
    const { status, body } = await api('POST', '/api/item-categories', { name: 'Ferragens', color_hex: '#ABCDEF' });

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ name: 'Ferragens', color_hex: '#ABCDEF' });
    expect(body.message['pt-br']).toBe('Categoria criada com sucesso.');
  });

  it.each([[{ name: 'x' }], [{ color_hex: '#000000' }]])('requires name and color (%j)', async (payload) => {
    const { status, body } = await api('POST', '/api/item-categories', payload);

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Nome e cor são obrigatórios.');
  });

  it('rejects colors outside #RRGGBB', async () => {
    const { status, body } = await api('POST', '/api/item-categories', { name: 'x', color_hex: 'red' });

    expect(status).toBe(422);
    expect(body.message['en-us']).toBe('Invalid color. Use the #RRGGBB format.');
  });
});

describe('PUT /api/item-categories/:id', () => {
  it('updates a category', async () => {
    const category = await factories.category();

    const { status, body } = await api('PUT', `/api/item-categories/${category.id}`, { name: 'Novo', color_hex: '#000000' });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ id: category.id, name: 'Novo', color_hex: '#000000' });
  });

  it('returns 404 for an unknown category', async () => {
    const { status, body } = await api('PUT', '/api/item-categories/99', { name: 'a', color_hex: '#000000' });

    expect(status).toBe(404);
    expect(body.message['pt-br']).toBe('Categoria não encontrada.');
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('update');

    const { status, body } = await api('PUT', '/api/item-categories/1', { name: 'a', color_hex: '#000000' });

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error updating category.');
  });
});

describe('DELETE /api/item-categories/:id', () => {
  it('deletes a category', async () => {
    const category = await factories.category();

    const { status, body } = await api('DELETE', `/api/item-categories/${category.id}`);

    expect(status).toBe(200);
    expect(body.message['pt-br']).toBe('Categoria excluída com sucesso.');
  });

  it('returns 404 for an unknown category', async () => {
    expect((await api('DELETE', '/api/item-categories/99')).status).toBe(404);
  });

  it('returns 409 while the category is linked to an item', async () => {
    const unit = await factories.unit();
    const category = await factories.category();
    const item = await factories.item({ unit_id: unit.id });
    await factories.linkCategory(item.id, category.id);

    const { status } = await api('DELETE', `/api/item-categories/${category.id}`);

    expect(status).toBe(409);
  });
});
