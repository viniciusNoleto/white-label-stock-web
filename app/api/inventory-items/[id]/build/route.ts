import { db } from '@/libs/db';
import { inventoryItems, inventoryItemHasComponent } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const quantity = Number(body.quantity ?? 1);

    if (quantity <= 0) {
      return NextResponse.json({ success: false, message: { 'pt-br': 'Quantidade deve ser maior que zero.', 'es-mx': 'La cantidad debe ser mayor que cero.', 'en-us': 'Quantity must be greater than zero.' }, data: null }, { status: 422 });
    }

    const components = await db
      .select({
        component_id: inventoryItemHasComponent.component_inventory_item_id,
        quantity_required: inventoryItemHasComponent.quantity_required,
        current_quantity: inventoryItems.quantity,
        component_name: inventoryItems.name,
      })
      .from(inventoryItemHasComponent)
      .innerJoin(inventoryItems, eq(inventoryItemHasComponent.component_inventory_item_id, inventoryItems.id))
      .where(eq(inventoryItemHasComponent.inventory_item_id, Number(id)));

    if (!components.length) {
      return NextResponse.json({ success: false, message: { 'pt-br': 'Este item não possui componentes cadastrados.', 'es-mx': 'Este artículo no tiene componentes registrados.', 'en-us': 'This item has no registered components.' }, data: null }, { status: 422 });
    }

    // Check if there's enough stock for each component
    for (const comp of components) {
      const required = Number(comp.quantity_required) * quantity;
      const available = Number(comp.current_quantity);
      if (available < required) {
        return NextResponse.json({
          success: false,
          message: {
            'pt-br': `Estoque insuficiente de "${comp.component_name}". Necessário: ${required}, Disponível: ${available}.`,
            'es-mx': `Existencias insuficientes de "${comp.component_name}". Necesario: ${required}, Disponible: ${available}.`,
            'en-us': `Insufficient stock of "${comp.component_name}". Required: ${required}, Available: ${available}.`,
          },
          data: null,
        }, { status: 422 });
      }
    }

    const now = new Date();

    // Deduct components atomically
    for (const comp of components) {
      const deduct = Number(comp.quantity_required) * quantity;
      await db
        .update(inventoryItems)
        .set({ quantity: sql`${inventoryItems.quantity} - ${deduct}`, updated_at: now })
        .where(eq(inventoryItems.id, comp.component_id));
    }

    // Increment the built item atomically
    const [updated] = await db
      .update(inventoryItems)
      .set({ quantity: sql`${inventoryItems.quantity} + ${quantity}`, updated_at: now })
      .where(eq(inventoryItems.id, Number(id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: {
        'pt-br': `${quantity} unidade(s) construída(s) com sucesso.`,
        'es-mx': `${quantity} unidad(es) construida(s) con éxito.`,
        'en-us': `${quantity} unit(s) built successfully.`,
      },
      data: updated,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: { 'pt-br': 'Erro ao construir item.', 'es-mx': 'Error al construir el artículo.', 'en-us': 'Error building item.' }, data: null }, { status: 500 });
  }
}
