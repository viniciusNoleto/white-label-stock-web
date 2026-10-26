import { Router } from 'express';
import { count, eq, ilike, inArray, sql } from 'drizzle-orm';
import type { PgUpdateSetSource } from 'drizzle-orm/pg-core';
import {
  inventoryItemHasCategory,
  inventoryItemHasComponent,
  inventoryItems,
  itemCategories,
  storages,
  units,
} from '../../../db/schema';
import type { ApiMessage } from '../../shared/types/api';
import { db } from '../db';
import { isPostgresError, jsonError, jsonOk, msg, parseId } from '../utils/api';

const NOT_FOUND = msg('Item não encontrado.', 'Artículo no encontrado.', 'Item not found.');
const NAME_REQUIRED = msg('Nome é obrigatório.', 'El nombre es obligatorio.', 'Name is required.');
const INVALID_QUANTITY = msg('Quantidade inválida.', 'Cantidad inválida.', 'Invalid quantity.');
const INVALID_REFERENCE = msg(
  'Unidade, armazenamento, categoria ou componente informado não existe.',
  'La unidad, el almacenamiento, la categoría o el componente informado no existe.',
  'The given unit, storage, category or component does not exist.',
);

export const inventoryItemsRouter = Router();

function isPresent(value: unknown) {
  return value !== undefined && value !== null;
}

function toFiniteNumber(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

inventoryItemsRouter.get('/', async (req, res) => {
  try {
    const search = typeof req.query['search'] === 'string' ? req.query['search'].trim() : '';
    const page = Math.max(1, Number(req.query['page'] ?? 1) || 1);
    const perPage = Math.min(100, Math.max(1, Number(req.query['per_page'] ?? 15) || 15));

    const where = search ? ilike(inventoryItems.name, `%${search}%`) : undefined;

    const [{ total }] = await db.select({ total: count() }).from(inventoryItems).where(where);

    const rows = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.name,
        quantity: inventoryItems.quantity,
        created_at: inventoryItems.created_at,
        updated_at: inventoryItems.updated_at,
        unit_id: units.id,
        unit_name: units.name,
        unit_abbreviation: units.abbreviation,
        storage_id: storages.id,
        storage_name: storages.name,
      })
      .from(inventoryItems)
      .innerJoin(units, eq(inventoryItems.unit_id, units.id))
      .leftJoin(storages, eq(inventoryItems.storage_id, storages.id))
      .where(where)
      .orderBy(inventoryItems.name, inventoryItems.id)
      .limit(perPage)
      .offset((page - 1) * perPage);

    const ids = rows.map((row) => row.id);

    const categoryRows = ids.length
      ? await db
          .select({
            inventory_item_id: inventoryItemHasCategory.inventory_item_id,
            id: itemCategories.id,
            name: itemCategories.name,
            color_hex: itemCategories.color_hex,
          })
          .from(inventoryItemHasCategory)
          .innerJoin(itemCategories, eq(inventoryItemHasCategory.item_category_id, itemCategories.id))
          .where(inArray(inventoryItemHasCategory.inventory_item_id, ids))
          .orderBy(itemCategories.name)
      : [];

    const componentRows = ids.length
      ? await db
          .select({
            inventory_item_id: inventoryItemHasComponent.inventory_item_id,
            component_id: inventoryItemHasComponent.component_inventory_item_id,
            quantity_required: inventoryItemHasComponent.quantity_required,
            component_name: inventoryItems.name,
            component_quantity: inventoryItems.quantity,
          })
          .from(inventoryItemHasComponent)
          .innerJoin(inventoryItems, eq(inventoryItemHasComponent.component_inventory_item_id, inventoryItems.id))
          .where(inArray(inventoryItemHasComponent.inventory_item_id, ids))
          .orderBy(inventoryItems.name)
      : [];

    const items = rows.map((row) => ({
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      created_at: row.created_at,
      updated_at: row.updated_at,
      unit: {
        id: row.unit_id,
        name: row.unit_name,
        abbreviation: row.unit_abbreviation,
      },
      storage: row.storage_id !== null ? { id: row.storage_id, name: row.storage_name! } : null,
      categories: categoryRows
        .filter((category) => category.inventory_item_id === row.id)
        .map((category) => ({ id: category.id, name: category.name, color_hex: category.color_hex })),
      components: componentRows
        .filter((component) => component.inventory_item_id === row.id)
        .map((component) => ({
          id: component.component_id,
          name: component.component_name,
          quantity_required: component.quantity_required,
          current_quantity: component.component_quantity,
        })),
    }));

    return jsonOk(res, {
      items,
      meta: { page, per_page: perPage, total, last_page: Math.max(1, Math.ceil(total / perPage)) },
    });
  } catch (error) {
    console.error(error);
    return jsonError(res, msg('Erro ao buscar itens.', 'Error al buscar artículos.', 'Error fetching items.'), 500);
  }
});

inventoryItemsRouter.post('/', async (req, res) => {
  try {
    const body = req.body ?? {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const unitId = parseId(body.unit_id);

    if (!name || !unitId) {
      return jsonError(res, msg('Nome e unidade são obrigatórios.', 'El nombre y la unidad son obligatorios.', 'Name and unit are required.'), 422);
    }

    const quantity = isPresent(body.quantity) ? toFiniteNumber(body.quantity) : 0;
    if (quantity === null || quantity < 0) return jsonError(res, INVALID_QUANTITY, 422);

    const categoryIds: number[] = Array.isArray(body.category_ids)
      ? [...new Set<number>(body.category_ids.map(parseId).filter((id: number | null): id is number => id !== null))]
      : [];

    const components: Array<{ id: number; quantity_required: number }> = Array.isArray(body.components)
      ? body.components.map((component: { id?: unknown; quantity_required?: unknown }) => ({
          id: parseId(component?.id) ?? 0,
          quantity_required: toFiniteNumber(component?.quantity_required) ?? 0,
        }))
      : [];

    if (components.some((component) => !component.id || component.quantity_required <= 0)) {
      return jsonError(res, msg(
        'Cada componente precisa de um item e de uma quantidade maior que zero.',
        'Cada componente necesita un artículo y una cantidad mayor que cero.',
        'Each component needs an item and a quantity greater than zero.',
      ), 422);
    }

    const now = new Date();

    const item = await db.transaction(async (tx) => {
      const [created] = await tx.insert(inventoryItems).values({
        name,
        quantity: String(quantity),
        unit_id: unitId,
        storage_id: parseId(body.storage_id),
        created_at: now,
        updated_at: now,
      }).returning();

      if (categoryIds.length) {
        await tx.insert(inventoryItemHasCategory).values(
          categoryIds.map((categoryId) => ({
            inventory_item_id: created.id,
            item_category_id: categoryId,
            created_at: now,
          })),
        );
      }

      if (components.length) {
        await tx.insert(inventoryItemHasComponent).values(
          components.map((component) => ({
            inventory_item_id: created.id,
            component_inventory_item_id: component.id,
            quantity_required: String(component.quantity_required),
            created_at: now,
          })),
        );
      }

      return created;
    });

    return jsonOk(res, item, msg('Item criado com sucesso.', 'Artículo creado con éxito.', 'Item created successfully.'), 201);
  } catch (error) {
    if (isPostgresError(error, '23503')) return jsonError(res, INVALID_REFERENCE, 422);

    console.error(error);
    return jsonError(res, msg('Erro ao criar item.', 'Error al crear el artículo.', 'Error creating item.'), 500);
  }
});

inventoryItemsRouter.patch('/:id', async (req, res) => {
  try {
    const id = parseId(req.params['id']);
    if (!id) return jsonError(res, NOT_FOUND, 404);

    const body = req.body ?? {};

    const hasQuantity = isPresent(body.quantity);
    const hasQuantityAdd = isPresent(body.quantity_add);
    const hasQuantitySubtract = isPresent(body.quantity_subtract);
    const hasName = isPresent(body.name);
    const hasStorageId = 'storage_id' in body;

    if (!hasQuantity && !hasQuantityAdd && !hasQuantitySubtract && !hasName && !hasStorageId) {
      return jsonError(res, msg(
        'Nenhum campo para atualizar foi fornecido.',
        'No se proporcionó ningún campo para actualizar.',
        'No field to update was provided.',
      ), 422);
    }

    const setValues: PgUpdateSetSource<typeof inventoryItems> = { updated_at: new Date() };

    if (hasQuantity) {
      const quantity = toFiniteNumber(body.quantity);
      if (quantity === null || quantity < 0) return jsonError(res, INVALID_QUANTITY, 422);
      setValues.quantity = String(quantity);
    }

    if (hasQuantityAdd) {
      const amount = toFiniteNumber(body.quantity_add);
      if (amount === null) return jsonError(res, INVALID_QUANTITY, 422);
      setValues.quantity = sql`${inventoryItems.quantity} + ${amount}`;
    }

    if (hasQuantitySubtract) {
      const amount = toFiniteNumber(body.quantity_subtract);
      if (amount === null) return jsonError(res, INVALID_QUANTITY, 422);
      setValues.quantity = sql`${inventoryItems.quantity} - ${amount}`;
    }

    if (hasName) {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!name) return jsonError(res, NAME_REQUIRED, 422);
      setValues.name = name;
    }

    if (hasStorageId) setValues.storage_id = parseId(body.storage_id);

    const [updated] = await db
      .update(inventoryItems)
      .set(setValues)
      .where(eq(inventoryItems.id, id))
      .returning();

    if (!updated) return jsonError(res, NOT_FOUND, 404);

    let message: ApiMessage;

    if (hasName) {
      message = msg('Nome atualizado com sucesso.', 'Nombre actualizado con éxito.', 'Name updated successfully.');
    } else if (hasStorageId) {
      message = msg('Armazenamento atualizado com sucesso.', 'Almacenamiento actualizado con éxito.', 'Storage updated successfully.');
    } else {
      message = msg('Quantidade atualizada com sucesso.', 'Cantidad actualizada con éxito.', 'Quantity updated successfully.');
    }

    return jsonOk(res, updated, message);
  } catch (error) {
    if (isPostgresError(error, '23503')) return jsonError(res, INVALID_REFERENCE, 422);

    console.error(error);
    return jsonError(res, msg('Erro ao atualizar o item.', 'Error al actualizar el artículo.', 'Error updating the item.'), 500);
  }
});

class InsufficientStockError extends Error {
  constructor(readonly apiMessage: ApiMessage) {
    super('insufficient stock');
  }
}

inventoryItemsRouter.post('/:id/build', async (req, res) => {
  try {
    const id = parseId(req.params['id']);
    if (!id) return jsonError(res, NOT_FOUND, 404);

    const quantity = isPresent(req.body?.quantity) ? toFiniteNumber(req.body.quantity) : 1;

    if (quantity === null || quantity <= 0) {
      return jsonError(res, msg('Quantidade deve ser maior que zero.', 'La cantidad debe ser mayor que cero.', 'Quantity must be greater than zero.'), 422);
    }

    const updated = await db.transaction(async (tx) => {
      const recipe = await tx
        .select({
          component_id: inventoryItemHasComponent.component_inventory_item_id,
          quantity_required: inventoryItemHasComponent.quantity_required,
        })
        .from(inventoryItemHasComponent)
        .where(eq(inventoryItemHasComponent.inventory_item_id, id));

      if (!recipe.length) return null;

      // Trava as linhas dos componentes até o fim da transação: duas
      // construções simultâneas não conseguem consumir o mesmo estoque.
      const stock = await tx
        .select({ id: inventoryItems.id, name: inventoryItems.name, quantity: inventoryItems.quantity })
        .from(inventoryItems)
        .where(inArray(inventoryItems.id, recipe.map((component) => component.component_id)))
        .orderBy(inventoryItems.id)
        .for('update');

      const now = new Date();

      for (const component of recipe) {
        const current = stock.find((row) => row.id === component.component_id)!;
        const required = Number(component.quantity_required) * quantity;
        const available = Number(current.quantity);

        if (available < required) {
          throw new InsufficientStockError(msg(
            `Estoque insuficiente de "${current.name}". Necessário: ${required}, Disponível: ${available}.`,
            `Existencias insuficientes de "${current.name}". Necesario: ${required}, Disponible: ${available}.`,
            `Insufficient stock of "${current.name}". Required: ${required}, Available: ${available}.`,
          ));
        }

        await tx
          .update(inventoryItems)
          .set({ quantity: sql`${inventoryItems.quantity} - ${required}`, updated_at: now })
          .where(eq(inventoryItems.id, component.component_id));
      }

      const [built] = await tx
        .update(inventoryItems)
        .set({ quantity: sql`${inventoryItems.quantity} + ${quantity}`, updated_at: now })
        .where(eq(inventoryItems.id, id))
        .returning();

      return built;
    });

    if (!updated) {
      return jsonError(res, msg(
        'Este item não possui componentes cadastrados.',
        'Este artículo no tiene componentes registrados.',
        'This item has no registered components.',
      ), 422);
    }

    return jsonOk(res, updated, msg(
      `${quantity} unidade(s) construída(s) com sucesso.`,
      `${quantity} unidad(es) construida(s) con éxito.`,
      `${quantity} unit(s) built successfully.`,
    ));
  } catch (error) {
    if (error instanceof InsufficientStockError) return jsonError(res, error.apiMessage, 422);

    console.error(error);
    return jsonError(res, msg('Erro ao construir item.', 'Error al construir el artículo.', 'Error building item.'), 500);
  }
});
