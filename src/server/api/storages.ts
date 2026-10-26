import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { storages } from '../../../db/schema';
import { db } from '../db';
import { isPostgresError, jsonError, jsonOk, msg, parseId } from '../utils/api';

const NOT_FOUND = msg('Armazenamento não encontrado.', 'Almacenamiento no encontrado.', 'Storage not found.');
const NAME_REQUIRED = msg('Nome é obrigatório.', 'El nombre es obligatorio.', 'Name is required.');

export const storagesRouter = Router();

function readDescription(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

storagesRouter.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(storages).orderBy(storages.name);
    return jsonOk(res, rows);
  } catch (error) {
    console.error(error);
    return jsonError(res, msg('Erro ao buscar armazenamentos.', 'Error al buscar almacenamientos.', 'Error fetching storages.'), 500);
  }
});

storagesRouter.post('/', async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

    if (!name) return jsonError(res, NAME_REQUIRED, 422);

    const now = new Date();
    const [storage] = await db.insert(storages).values({
      name,
      description: readDescription(req.body?.description),
      created_at: now,
      updated_at: now,
    }).returning();

    return jsonOk(res, storage, msg('Armazenamento criado com sucesso.', 'Almacenamiento creado con éxito.', 'Storage created successfully.'), 201);
  } catch (error) {
    console.error(error);
    return jsonError(res, msg('Erro ao criar armazenamento.', 'Error al crear el almacenamiento.', 'Error creating storage.'), 500);
  }
});

storagesRouter.put('/:id', async (req, res) => {
  try {
    const id = parseId(req.params['id']);
    if (!id) return jsonError(res, NOT_FOUND, 404);

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

    if (!name) return jsonError(res, NAME_REQUIRED, 422);

    const [updated] = await db
      .update(storages)
      .set({ name, description: readDescription(req.body?.description), updated_at: new Date() })
      .where(eq(storages.id, id))
      .returning();

    if (!updated) return jsonError(res, NOT_FOUND, 404);

    return jsonOk(res, updated, msg('Armazenamento atualizado com sucesso.', 'Almacenamiento actualizado con éxito.', 'Storage updated successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(res, msg('Erro ao atualizar armazenamento.', 'Error al actualizar el almacenamiento.', 'Error updating storage.'), 500);
  }
});

storagesRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseId(req.params['id']);
    if (!id) return jsonError(res, NOT_FOUND, 404);

    const [deleted] = await db.delete(storages).where(eq(storages.id, id)).returning();

    if (!deleted) return jsonError(res, NOT_FOUND, 404);

    return jsonOk(res, null, msg('Armazenamento excluído com sucesso.', 'Almacenamiento eliminado con éxito.', 'Storage deleted successfully.'));
  } catch (error) {
    if (isPostgresError(error, '23503')) {
      return jsonError(res, msg('Este armazenamento está em uso por itens do inventário.', 'Este almacenamiento está en uso por artículos del inventario.', 'This storage is in use by inventory items.'), 409);
    }

    console.error(error);
    return jsonError(res, msg('Erro ao excluir armazenamento.', 'Error al eliminar el almacenamiento.', 'Error deleting storage.'), 500);
  }
});
