import { describe, expect, it } from 'vitest';
import { GET, POST } from '@/app/api/storages/route';
import { PUT, DELETE } from '@/app/api/storages/[id]/route';
import { factories, failNextDbCall, jsonRequest, params, readJson } from '../support/api';

describe('GET /api/storages', () => {
  it('lists storages ordered by name', async () => {
    await factories.storage({ name: 'Galpão' });
    await factories.storage({ name: 'Almoxarifado', description: 'Térreo' });

    const { status, body } = await readJson(await GET());

    expect(status).toBe(200);
    expect(body.data).toMatchObject([{ name: 'Almoxarifado', description: 'Térreo' }, { name: 'Galpão', description: null }]);
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('select');

    const { status, body } = await readJson(await GET());

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error fetching storages.');
  });
});

describe('POST /api/storages', () => {
  it('creates a storage with description', async () => {
    const { status, body } = await readJson(await POST(jsonRequest('/api/storages', 'POST', { name: 'Prateleira 1', description: 'Corredor B' })));

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ name: 'Prateleira 1', description: 'Corredor B' });
  });

  it('stores an empty description as null', async () => {
    const { body } = await readJson(await POST(jsonRequest('/api/storages', 'POST', { name: 'Prateleira 2', description: '' })));

    expect(body.data.description).toBeNull();
  });

  it('requires a name', async () => {
    const { status, body } = await readJson(await POST(jsonRequest('/api/storages', 'POST', { description: 'x' })));

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Nome é obrigatório.');
  });

  it('returns 500 when insertion fails', async () => {
    failNextDbCall('insert');

    const { status } = await readJson(await POST(jsonRequest('/api/storages', 'POST', { name: 'x' })));

    expect(status).toBe(500);
  });
});

describe('PUT /api/storages/:id', () => {
  it('updates a storage and clears the description', async () => {
    const storage = await factories.storage({ description: 'antiga' });

    const { status, body } = await readJson(await PUT(
      jsonRequest(`/api/storages/${storage.id}`, 'PUT', { name: 'Renomeado' }),
      params({ id: String(storage.id) }),
    ));

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ name: 'Renomeado', description: null });
    expect(body.message['pt-br']).toBe('Armazenamento atualizado com sucesso.');
  });

  it('requires a name', async () => {
    const { status } = await readJson(await PUT(jsonRequest('/api/storages/1', 'PUT', {}), params({ id: '1' })));

    expect(status).toBe(422);
  });

  it('returns 404 for an unknown storage', async () => {
    const { status } = await readJson(await PUT(jsonRequest('/api/storages/3', 'PUT', { name: 'x' }), params({ id: '3' })));

    expect(status).toBe(404);
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('update');

    const { status } = await readJson(await PUT(jsonRequest('/api/storages/1', 'PUT', { name: 'x' }), params({ id: '1' })));

    expect(status).toBe(500);
  });
});

describe('DELETE /api/storages/:id', () => {
  it('deletes a storage', async () => {
    const storage = await factories.storage();

    const { status, body } = await readJson(await DELETE(jsonRequest('/x', 'DELETE'), params({ id: String(storage.id) })));

    expect(status).toBe(200);
    expect(body.message['pt-br']).toBe('Armazenamento excluído com sucesso.');
  });

  it('returns 404 for an unknown storage', async () => {
    const { status } = await readJson(await DELETE(jsonRequest('/x', 'DELETE'), params({ id: '3' })));

    expect(status).toBe(404);
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('delete');

    const { status, body } = await readJson(await DELETE(jsonRequest('/x', 'DELETE'), params({ id: '1' })));

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error deleting storage.');
  });
});
