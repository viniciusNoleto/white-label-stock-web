import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { units } from '../../../db/schema';
import { db } from '../db';
import { isPostgresError, jsonError, jsonOk, msg, parseId } from '../utils/api';

const NOT_FOUND = msg('Unidade não encontrada.', 'Unidad no encontrada.', 'Unit not found.');
const REQUIRED_FIELDS = msg('Nome e abreviação são obrigatórios.', 'El nombre y la abreviatura son obligatorios.', 'Name and abbreviation are required.');

export const unitsRouter = Router();

unitsRouter.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(units).orderBy(units.name);
    return jsonOk(res, rows);
  } catch (error) {
    console.error(error);
    return jsonError(res, msg('Erro ao buscar unidades.', 'Error al buscar unidades.', 'Error fetching units.'), 500);
  }
});

unitsRouter.post('/', async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const abbreviation = typeof req.body?.abbreviation === 'string' ? req.body.abbreviation.trim() : '';

    if (!name || !abbreviation) return jsonError(res, REQUIRED_FIELDS, 422);

    const now = new Date();
    const [unit] = await db.insert(units).values({ name, abbreviation, created_at: now, updated_at: now }).returning();

    return jsonOk(res, unit, msg('Unidade criada com sucesso.', 'Unidad creada con éxito.', 'Unit created successfully.'), 201);
  } catch (error) {
    console.error(error);
    return jsonError(res, msg('Erro ao criar unidade.', 'Error al crear la unidad.', 'Error creating unit.'), 500);
  }
});

unitsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseId(req.params['id']);
    if (!id) return jsonError(res, NOT_FOUND, 404);

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const abbreviation = typeof req.body?.abbreviation === 'string' ? req.body.abbreviation.trim() : '';

    if (!name || !abbreviation) return jsonError(res, REQUIRED_FIELDS, 422);

    const [updated] = await db
      .update(units)
      .set({ name, abbreviation, updated_at: new Date() })
      .where(eq(units.id, id))
      .returning();

    if (!updated) return jsonError(res, NOT_FOUND, 404);

    return jsonOk(res, updated, msg('Unidade atualizada com sucesso.', 'Unidad actualizada con éxito.', 'Unit updated successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(res, msg('Erro ao atualizar unidade.', 'Error al actualizar la unidad.', 'Error updating unit.'), 500);
  }
});

unitsRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseId(req.params['id']);
    if (!id) return jsonError(res, NOT_FOUND, 404);

    const [deleted] = await db.delete(units).where(eq(units.id, id)).returning();

    if (!deleted) return jsonError(res, NOT_FOUND, 404);

    return jsonOk(res, null, msg('Unidade excluída com sucesso.', 'Unidad eliminada con éxito.', 'Unit deleted successfully.'));
  } catch (error) {
    if (isPostgresError(error, '23503')) {
      return jsonError(res, msg('Esta unidade está em uso por itens do inventário.', 'Esta unidad está en uso por artículos del inventario.', 'This unit is in use by inventory items.'), 409);
    }

    console.error(error);
    return jsonError(res, msg('Erro ao excluir unidade.', 'Error al eliminar la unidad.', 'Error deleting unit.'), 500);
  }
});
