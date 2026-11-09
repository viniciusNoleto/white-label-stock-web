export interface IProductUnit {
  id: number;
  name: string;
  abbreviation: string;
}

export interface IProductCategory {
  id: number;
  name: string;
  color_hex: string;
}

/** Componente da receita: quanto é usado por unidade produzida e o estoque (e o reservado) dele. */
export interface IProductComponent {
  id: number;
  name: string;
  is_atomic: boolean;
  quantity_required: string;
  stock_quantity: string;
  reserved_quantity: string;
  expired_quantity: string;
}

/**
 * Produto: o modelo dos itens. Atômico (`is_atomic`) → cada unidade é um item com código;
 * a granel → um item guarda uma quantidade (lote). `shelf_life_days` = dias de validade após a produção.
 */
export interface IProduct {
  id: number;
  name: string;
  sku: string | null;
  is_atomic: boolean;
  shelf_life_days: number | null;
  /** Soma das quantidades dos itens. */
  stock_quantity: string;
  /** Separado em pacotes de entrega pendentes. */
  reserved_quantity: string;
  /** Itens vencidos: não vão para produção nem entrega. */
  expired_quantity: string;
  items_count: number;
  created_at: string | null;
  updated_at: string | null;
  unit: IProductUnit;
  categories: IProductCategory[];
  components: IProductComponent[];
}

/** Estoque livre: nem reservado nem vencido (a API não usa vencidos) — nunca negativo. */
export function freeStock(product: Pick<IProduct, 'stock_quantity' | 'reserved_quantity' | 'expired_quantity'>, ownQuantity = 0): number {
  return Math.max(0, Number(product.stock_quantity) - Number(product.reserved_quantity) - Number(product.expired_quantity) + ownQuantity);
}

/**
 * Quanto dá para produzir com o estoque livre dos componentes. Produto atômico só em
 * unidades inteiras; sem receita, `null` (não há limite).
 */
export function maxProducible(product: Pick<IProduct, 'is_atomic' | 'components'>): number | null {
  if (!product.components.length) return null;

  const max = Math.min(...product.components.map((component) => freeStock(component) / Number(component.quantity_required)));

  return product.is_atomic ? Math.floor(max) : Math.floor(max * 10_000) / 10_000;
}

/** Exemplo do código automático do próximo item (`ARM-A-0001`, ou `P12-0001` sem SKU). */
export function itemCodeExample(product: Pick<IProduct, 'id' | 'sku'>): string {
  return `${product.sku || `P${product.id}`}-0001`;
}
