import { db } from "@/libs/db";
import { inventoryItems } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const hasQuantity = body.quantity !== undefined && body.quantity !== null;
    const hasQuantityAdd = body.quantity_add !== undefined && body.quantity_add !== null;
    const hasQuantitySubtract = body.quantity_subtract !== undefined && body.quantity_subtract !== null;
    const hasName = body.name !== undefined && body.name !== null;
    const hasStorageId = 'storage_id' in body;

    if (!hasQuantity && !hasQuantityAdd && !hasQuantitySubtract && !hasName && !hasStorageId) {
      return NextResponse.json(
        {
          success: false,
          message: {
            "pt-br": "Nenhum campo para atualizar foi fornecido.",
            "es-mx": "No se proporcionó ningún campo para actualizar.",
            "en-us": "No field to update was provided.",
          },
          data: null,
        },
        { status: 422 },
      );
    }

    const setValues: Record<string, unknown> = { updated_at: new Date() };

    if (hasQuantity) setValues.quantity = String(body.quantity);
    if (hasQuantityAdd) setValues.quantity = sql`${inventoryItems.quantity} + ${Number(body.quantity_add)}`;
    if (hasQuantitySubtract) setValues.quantity = sql`${inventoryItems.quantity} - ${Number(body.quantity_subtract)}`;
    if (hasName) {
      if (!body.name.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: {
              "pt-br": "Nome é obrigatório.",
              "es-mx": "El nombre es obligatorio.",
              "en-us": "Name is required.",
            },
            data: null,
          },
          { status: 422 },
        );
      }
      setValues.name = body.name.trim();
    }
    if (hasStorageId) setValues.storage_id = body.storage_id ?? null;

    const [updated] = await db
      .update(inventoryItems)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set(setValues as any)
      .where(eq(inventoryItems.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: {
            "pt-br": "Item não encontrado.",
            "es-mx": "Artículo no encontrado.",
            "en-us": "Item not found.",
          },
          data: null,
        },
        { status: 404 },
      );
    }

    let message: { "pt-br": string; "es-mx": string; "en-us": string };

    if (hasName) {
      message = {
        "pt-br": "Nome atualizado com sucesso.",
        "es-mx": "Nombre actualizado con éxito.",
        "en-us": "Name updated successfully.",
      };
    } else if (hasStorageId) {
      message = {
        "pt-br": "Armazenamento atualizado com sucesso.",
        "es-mx": "Almacenamiento actualizado con éxito.",
        "en-us": "Storage updated successfully.",
      };
    } else {
      message = {
        "pt-br": "Quantidade atualizada com sucesso.",
        "es-mx": "Cantidad actualizada con éxito.",
        "en-us": "Quantity updated successfully.",
      };
    }

    return NextResponse.json({ success: true, message, data: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        success: false,
        message: {
          "pt-br": "Erro ao atualizar o item.",
          "es-mx": "Error al actualizar el artículo.",
          "en-us": "Error updating the item.",
        },
        data: null,
      },
      { status: 500 },
    );
  }
}
