import { describe, expect, it } from 'vitest';
import { factories } from './support/factories';
import { api, failNextDbCall } from './support/http';

describe('GET /api/storages', () => {
  it('lists storages ordered by name', async () => {
    await factories.storage({ name: 'Galpão' });
    await factories.storage({ name: 'Almoxarifado', description: 'Térreo' });

    const { status, body } = await api('GET', '/api/storages');

    expect(status).toBe(200);
    expect(body.data.map((storage: { name: string }) => storage.name)).toEqual(['Almoxarifado', 'Galpão']);
    expect(Object.keys(body.data[0])).toEqual(['id', 'name', 'description', 'created_at', 'updated_at']);
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('select');

    const { status, body } = await api('GET', '/api/storages');

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error fetching storages.');
  });
});

describe('POST /api/storages', () => {
  it('creates a storage, storing a blank description as null', async () => {
    const { status, body } = await api('POST', '/api/storages', { name: 'Depósito', description: '   ' });

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ name: 'Depósito', description: null });
    expect(body.message['pt-br']).toBe('Armazenamento criado com sucesso.');
  });

  it('requires a name', async () => {
    const { status, body } = await api('POST', '/api/storages', { description: 'x' });

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Nome é obrigatório.');
  });
});

describe('PUT /api/storages/:id', () => {
  it('updates a storage', async () => {
    const storage = await factories.storage();

    const { status, body } = await api('PUT', `/api/storages/${storage.id}`, { name: 'Novo', description: 'Fundos' });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ name: 'Novo', description: 'Fundos' });
  });

  it('returns 404 for an unknown storage', async () => {
    const { status, body } = await api('PUT', '/api/storages/99', { name: 'a' });

    expect(status).toBe(404);
    expect(body.message['pt-br']).toBe('Armazenamento não encontrado.');
  });
});

describe('DELETE /api/storages/:id', () => {
  it('deletes a storage', async () => {
    const storage = await factories.storage();

    expect((await api('DELETE', `/api/storages/${storage.id}`)).status).toBe(200);
  });

  it('returns 409 while the storage holds items', async () => {
    const unit = await factories.unit();
    const storage = await factories.storage();
    await factories.item({ unit_id: unit.id, storage_id: storage.id });

    const { status, body } = await api('DELETE', `/api/storages/${storage.id}`);

    expect(status).toBe(409);
    expect(body.message['en-us']).toBe('This storage is in use by inventory items.');
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('delete');

    const { status, body } = await api('DELETE', '/api/storages/1');

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error deleting storage.');
  });
});
