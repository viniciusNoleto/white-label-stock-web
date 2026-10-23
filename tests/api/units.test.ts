import { describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/units/route';
import { PUT, DELETE } from '@/app/api/units/[id]/route';
import { factories, failNextDbCall, jsonRequest, params, readJson } from '../support/api';

describe('GET /api/units', () => {
  it('lists units ordered by name', async () => {
    await factories.unit({ name: 'Metro', abbreviation: 'm' });
    await factories.unit({ name: 'Grama', abbreviation: 'g' });

    const { status, body } = await readJson(await GET());

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message['pt-br']).toBe('Operação realizada com sucesso.');
    expect(body.data.map((u: { name: string }) => u.name)).toEqual(['Grama', 'Metro']);
    expect(Object.keys(body.data[0])).toEqual(['id', 'name', 'abbreviation', 'created_at', 'updated_at']);
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('select');

    const { status, body } = await readJson(await GET());

    expect(status).toBe(500);
    expect(body).toMatchObject({ success: false, data: null, message: { 'en-us': 'Error fetching units.' } });
  });
});

describe('POST /api/units', () => {
  it('creates a unit', async () => {
    const { status, body } = await readJson(await POST(jsonRequest('/api/units', 'POST', { name: 'Litro', abbreviation: 'L' })));

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ id: 1, name: 'Litro', abbreviation: 'L' });
    expect(body.data.created_at).toBeTruthy();
    expect(body.message['pt-br']).toBe('Unidade criada com sucesso.');
  });

  it.each([
    [{ abbreviation: 'L' }],
    [{ name: 'Litro' }],
    [{ name: '', abbreviation: '' }],
  ])('rejects invalid payload %j with 422', async (payload) => {
    const { status, body } = await readJson(await POST(jsonRequest('/api/units', 'POST', payload)));

    expect(status).toBe(422);
    expect(body.message['pt-br']).toBe('Nome e abreviação são obrigatórios.');
  });

  it('returns 500 on malformed JSON', async () => {
    const req = new Request('http://localhost/api/units', { method: 'POST', body: '{oops' });

    const { status, body } = await readJson(await POST(req));

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error creating unit.');
  });
});

describe('PUT /api/units/:id', () => {
  it('updates an existing unit', async () => {
    const unit = await factories.unit();

    const { status, body } = await readJson(await PUT(
      jsonRequest(`/api/units/${unit.id}`, 'PUT', { name: 'Tonelada', abbreviation: 't' }),
      params({ id: String(unit.id) }),
    ));

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ id: unit.id, name: 'Tonelada', abbreviation: 't' });
    expect(body.message['pt-br']).toBe('Unidade atualizada com sucesso.');
  });

  it('validates required fields', async () => {
    const { status, body } = await readJson(await PUT(jsonRequest('/api/units/1', 'PUT', { name: 'x' }), params({ id: '1' })));

    expect(status).toBe(422);
    expect(body.success).toBe(false);
  });

  it('returns 404 for an unknown unit', async () => {
    const { status, body } = await readJson(await PUT(
      jsonRequest('/api/units/999', 'PUT', { name: 'a', abbreviation: 'b' }),
      params({ id: '999' }),
    ));

    expect(status).toBe(404);
    expect(body.message['pt-br']).toBe('Unidade não encontrada.');
  });

  it('returns 500 when the database fails', async () => {
    failNextDbCall('update');

    const { status } = await readJson(await PUT(jsonRequest('/api/units/1', 'PUT', { name: 'a', abbreviation: 'b' }), params({ id: '1' })));

    expect(status).toBe(500);
  });
});

describe('DELETE /api/units/:id', () => {
  it('deletes an existing unit', async () => {
    const unit = await factories.unit();

    const { status, body } = await readJson(await DELETE(jsonRequest(`/api/units/${unit.id}`, 'DELETE'), params({ id: String(unit.id) })));

    expect(status).toBe(200);
    expect(body).toMatchObject({ success: true, data: null });
    expect((await readJson(await GET())).body.data).toHaveLength(0);
  });

  it('returns 404 for an unknown unit', async () => {
    const { status } = await readJson(await DELETE(jsonRequest('/api/units/5', 'DELETE'), params({ id: '5' })));

    expect(status).toBe(404);
  });

  it('returns 500 when the lookup fails', async () => {
    failNextDbCall('select');

    const { status, body } = await readJson(await DELETE(jsonRequest('/api/units/1', 'DELETE'), params({ id: '1' })));

    expect(status).toBe(500);
    expect(body.message['en-us']).toBe('Error deleting unit.');
  });

  it('returns 500 when the unit is still referenced by an item (FK violation)', async () => {
    const unit = await factories.unit();
    await factories.item({ unit_id: unit.id });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { status } = await readJson(await DELETE(jsonRequest(`/api/units/${unit.id}`, 'DELETE'), params({ id: String(unit.id) })));

    expect(status).toBe(500);
  });
});
