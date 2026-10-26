import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { itemCategories } from '../../../db/schema';
import { db } from '../db';
import { isPostgresError, jsonError, jsonOk, msg, parseId } from '../utils/api';

const NOT_FOUND = msg('Categoria não encontrada.', 'Categoría no encontrada.', 'Category not found.');
const REQUIRED_FIELDS = msg('Nome e cor são obrigatórios.', 'El nombre y el color son obligatorios.', 'Name and color are required.');
const INVALID_COLOR = msg('Cor inválida. Use o formato #RRGGBB.', 'Color inválido. Usa el formato #RRGGBB.', 'Invalid color. Use the #RRGGBB format.');

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const itemCategoriesRouter = Router();

itemCategoriesRouter.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(itemCategories).orderBy(itemCategories.name);
    return jsonOk(res, rows);
  } catch (error) {
    console.error(error);
    return jsonError(res, msg('Erro ao buscar categorias.', 'Error al buscar categorías.', 'Error fetching categories.'), 500);
  }
});

itemCategoriesRouter.post('/', async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const colorHex = typeof req.body?.color_hex === 'string' ? req.body.color_hex.trim() : '';

    if (!name || !colorHex) return jsonError(res, REQUIRED_FIELDS, 422);
    if (!HEX_COLOR.test(colorHex)) return jsonError(res, INVALID_COLOR, 422);

    const now = new Date();
    const [category] = await db.insert(itemCategories).values({ name, color_hex: colorHex, created_at: now, updated_at: now }).returning();

    return jsonOk(res, category, msg('Categoria criada com sucesso.', 'Categoría creada con éxito.', 'Category created successfully.'), 201);
  } catch (error) {
    console.error(error);
    return jsonError(res, msg('Erro ao criar categoria.', 'Error al crear la categoría.', 'Error creating category.'), 500);
  }
});

itemCategoriesRouter.put('/:id', async (req, res) => {
  try {
    const id = parseId(req.params['id']);
    if (!id) return jsonError(res, NOT_FOUND, 404);

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const colorHex = typeof req.body?.color_hex === 'string' ? req.body.color_hex.trim() : '';

    if (!name || !colorHex) return jsonError(res, REQUIRED_FIELDS, 422);
    if (!HEX_COLOR.test(colorHex)) return jsonError(res, INVALID_COLOR, 422);

    const [updated] = await db
      .update(itemCategories)
      .set({ name, color_hex: colorHex, updated_at: new Date() })
      .where(eq(itemCategories.id, id))
      .returning();

    if (!updated) return jsonError(res, NOT_FOUND, 404);

    return jsonOk(res, updated, msg('Categoria atualizada com sucesso.', 'Categoría actualizada con éxito.', 'Category updated successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(res, msg('Erro ao atualizar categoria.', 'Error al actualizar la categoría.', 'Error updating category.'), 500);
  }
});

itemCategoriesRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseId(req.params['id']);
    if (!id) return jsonError(res, NOT_FOUND, 404);

    const [deleted] = await db.delete(itemCategories).where(eq(itemCategories.id, id)).returning();

    if (!deleted) return jsonError(res, NOT_FOUND, 404);

    return jsonOk(res, null, msg('Categoria excluída com sucesso.', 'Categoría eliminada con éxito.', 'Category deleted successfully.'));
  } catch (error) {
    if (isPostgresError(error, '23503')) {
      return jsonError(res, msg('Esta categoria está em uso por itens do inventário.', 'Esta categoría está en uso por artículos del inventario.', 'This category is in use by inventory items.'), 409);
    }

    console.error(error);
    return jsonError(res, msg('Erro ao excluir categoria.', 'Error al eliminar la categoría.', 'Error deleting category.'), 500);
  }
});
