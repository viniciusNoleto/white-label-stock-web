import { describe, expect, it } from 'vitest';
import { GET, POST } from '@/app/api/item-categories/route';
import { PUT, DELETE } from '@/app/api/item-categories/[id]/route';
import { factories, failNextDbCall, jsonRequest, params, readJson } from '../support/api';

describe('GET /api/item-categories', () => {
  it('lists categories ordered by name with snake_case keys', async () => {
    await factories.category({ name: 'Zinco', color_hex: '#000000' });
    await factories.category({ name: 'Aço', color_hex: '#ffffff' });

    const { status, body } = await readJson(await GET());

    expect(status).toBe(200);
    expect(body.data.map((c: { name: string }) => c.name)).toEqual(['Aço', 'Zinco']);
    expect(body.data[0]).toHaveProperty('color_hex', '#ffffff');
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('select');

    const { status, body } = await readJson(await GET());

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error fetching categories.');
  });
});

describe('POST /api/item-categories', () => {
  it('creates a category', async () => {
    const { status, body } = await readJson(await POST(jsonRequest('/api/item-categories', 'POST', { name: 'Eletrônicos', color_hex: '#2482ED' })));

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ name: 'Eletrônicos', color_hex: '#2482ED' });
    expect(body.message['pt-br']).toBe('Categoria criada com sucesso.');
  });

  it.each([[{ name: 'x' }], [{ color_hex: '#fff' }]])('rejects %j with 422', async (payload) => {
    const { status, body } = await readJson(await POST(jsonRequest('/api/item-categories', 'POST', payload)));

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Nome e cor são obrigatórios.');
  });

  it('returns 500 when insertion fails', async () => {
    failNextDbCall('insert');

    const { status, body } = await readJson(await POST(jsonRequest('/api/item-categories', 'POST', { name: 'x', color_hex: '#fff' })));

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error creating category.');
  });
});

describe('PUT /api/item-categories/:id', () => {
  it('updates a category', async () => {
    const category = await factories.category();

    const { status, body } = await readJson(await PUT(
      jsonRequest(`/api/item-categories/${category.id}`, 'PUT', { name: 'Novo', color_hex: '#abcdef' }),
      params({ id: String(category.id) }),
    ));

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ id: category.id, name: 'Novo', color_hex: '#abcdef' });
  });

  it('validates required fields', async () => {
    const { status } = await readJson(await PUT(jsonRequest('/api/item-categories/1', 'PUT', {}), params({ id: '1' })));

    expect(status).toBe(422);
  });

  it('returns 404 for an unknown category', async () => {
    const { status, body } = await readJson(await PUT(
      jsonRequest('/api/item-categories/42', 'PUT', { name: 'a', color_hex: '#000' }),
      params({ id: '42' }),
    ));

    expect(status).toBe(404);
    expect(body.message['pt-br']).toBe('Categoria não encontrada.');
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('update');

    const { status } = await readJson(await PUT(jsonRequest('/api/item-categories/1', 'PUT', { name: 'a', color_hex: '#000' }), params({ id: '1' })));

    expect(status).toBe(500);
  });
});

describe('DELETE /api/item-categories/:id', () => {
  it('deletes a category', async () => {
    const category = await factories.category();

    const { status, body } = await readJson(await DELETE(jsonRequest('/x', 'DELETE'), params({ id: String(category.id) })));

    expect(status).toBe(200);
    expect(body.message['pt-br']).toBe('Categoria excluída com sucesso.');
  });

  it('returns 404 for an unknown category', async () => {
    const { status } = await readJson(await DELETE(jsonRequest('/x', 'DELETE'), params({ id: '7' })));

    expect(status).toBe(404);
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('delete');

    const { status, body } = await readJson(await DELETE(jsonRequest('/x', 'DELETE'), params({ id: '1' })));

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error deleting category.');
  });
});
