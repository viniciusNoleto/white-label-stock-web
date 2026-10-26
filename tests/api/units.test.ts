import { describe, expect, it } from 'vitest';
import { factories } from './support/factories';
import { api, failNextDbCall } from './support/http';

describe('GET /api/units', () => {
  it('lists units ordered by name in the API envelope', async () => {
    await factories.unit({ name: 'Metro', abbreviation: 'm' });
    await factories.unit({ name: 'Grama', abbreviation: 'g' });

    const { status, body } = await api('GET', '/api/units');

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message['pt-br']).toBe('Operação realizada com sucesso.');
    expect(body.data.map((unit: { name: string }) => unit.name)).toEqual(['Grama', 'Metro']);
    expect(Object.keys(body.data[0])).toEqual(['id', 'name', 'abbreviation', 'created_at', 'updated_at']);
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('select');

    const { status, body } = await api('GET', '/api/units');

    expect(status).toBe(500);
    expect(body).toMatchObject({ success: false, data: null, message: { 'en-us': 'Error fetching units.' } });
  });
});

describe('POST /api/units', () => {
  it('creates a unit trimming the fields', async () => {
    const { status, body } = await api('POST', '/api/units', { name: '  Litro ', abbreviation: 'L' });

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ id: 1, name: 'Litro', abbreviation: 'L' });
    expect(body.data.created_at).toBeTruthy();
    expect(body.message['pt-br']).toBe('Unidade criada com sucesso.');
  });

  it.each([
    [{ abbreviation: 'L' }],
    [{ name: 'Litro' }],
    [{ name: '  ', abbreviation: '' }],
    [{ name: 1, abbreviation: 2 }],
  ])('rejects invalid payload %j with 422', async (payload) => {
    const { status, body } = await api('POST', '/api/units', payload);

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Nome e abreviação são obrigatórios.');
  });

  it('rejects malformed JSON with 400', async () => {
    const { status, body } = await api('POST', '/api/units', undefined, { rawBody: '{oops' });

    expect(status).toBe(400);
    expect(body).toMatchObject({ success: false, message: { 'en-us': 'Invalid data.' } });
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('insert');

    const { status, body } = await api('POST', '/api/units', { name: 'Litro', abbreviation: 'L' });

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error creating unit.');
  });
});

describe('PUT /api/units/:id', () => {
  it('updates an existing unit', async () => {
    const unit = await factories.unit();

    const { status, body } = await api('PUT', `/api/units/${unit.id}`, { name: 'Tonelada', abbreviation: 't' });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ id: unit.id, name: 'Tonelada', abbreviation: 't' });
    expect(body.message['pt-br']).toBe('Unidade atualizada com sucesso.');
  });

  it('validates required fields', async () => {
    const unit = await factories.unit();

    const { status, body } = await api('PUT', `/api/units/${unit.id}`, { name: 'x' });

    expect(status).toBe(422);
    expect(body.success).toBe(false);
  });

  it.each(['999', 'abc', '-1'])('returns 404 for unknown id %s', async (id) => {
    const { status, body } = await api('PUT', `/api/units/${id}`, { name: 'a', abbreviation: 'b' });

    expect(status).toBe(404);
    expect(body.message['pt-br']).toBe('Unidade não encontrada.');
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('update');

    const { status } = await api('PUT', '/api/units/1', { name: 'a', abbreviation: 'b' });

    expect(status).toBe(500);
  });
});

describe('DELETE /api/units/:id', () => {
  it('deletes an existing unit', async () => {
    const unit = await factories.unit();

    const { status, body } = await api('DELETE', `/api/units/${unit.id}`);

    expect(status).toBe(200);
    expect(body).toMatchObject({ success: true, data: null });
    expect((await api('GET', '/api/units')).body.data).toHaveLength(0);
  });

  it('returns 404 for an unknown unit', async () => {
    const { status } = await api('DELETE', '/api/units/5');

    expect(status).toBe(404);
  });

  it('returns 409 while the unit is used by an item', async () => {
    const unit = await factories.unit();
    await factories.item({ unit_id: unit.id });

    const { status, body } = await api('DELETE', `/api/units/${unit.id}`);

    expect(status).toBe(409);
    expect(body.message['en-us']).toBe('This unit is in use by inventory items.');
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('delete');

    const { status, body } = await api('DELETE', '/api/units/1');

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error deleting unit.');
  });
});
