import type { EWriteOffReason } from '@/resources/stock-movement/enums/WriteOffReason';

/** Janelas aceitas pela API (`?period=`), em dias terminando hoje. */
export const DASHBOARD_PERIODS = [7, 30, 90] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export const DEFAULT_DASHBOARD_PERIOD: DashboardPeriod = 30;

export interface IDashboardActivityDay {
  /** `YYYY-MM-DD` (dia do negócio). */
  date: string;
  /** Entradas + produção (movimentações). */
  inflow: number;
  /** Entregas + consumo da receita (movimentações). */
  outflow: number;
  /** Baixas (movimentações). */
  losses: number;
}

export interface IDashboardProductQuantity {
  /** `null` quando o produto foi excluído (o nome vem copiado da movimentação). */
  product_id: number | null;
  product_name: string;
  unit_abbreviation: string | null;
  quantity: string;
}

export interface IDashboardTopDelivered extends IDashboardProductQuantity {
  packages_count: number;
}

export interface IDashboardLossProduct extends IDashboardProductQuantity {
  movements_count: number;
  /** Quantas dessas baixas foram por vencimento. */
  expired_count: number;
}

export interface IDashboardRestock {
  product_id: number;
  product_name: string;
  unit_abbreviation: string;
  /** Dentro da validade, menos o reservado em pacotes pendentes. */
  free_quantity: string;
  /** Saída do período (entregas + consumo). */
  outflow_quantity: string;
  daily_outflow: string;
  /** Quantos dias o estoque livre aguenta no ritmo do período (`"0.0000"` = acabou). */
  coverage_days: string;
}

export interface IDashboardExpirationAlert {
  product_id: number;
  product_name: string;
  unit_abbreviation: string;
  expired_quantity: string;
  expiring_quantity: string;
  next_expires_at: string | null;
}

/**
 * Painel (`GET /api/dashboard`). Retrato do estoque de agora + números do período.
 * Contagens são `number`; quantidades vêm como string (decimal) e sempre por produto.
 */
export interface IDashboard {
  /** Quando os números foram calculados (a API guarda o painel em cache). */
  generated_at: string;
  period: { days: DashboardPeriod; from: string; to: string };
  stock: {
    products_count: number;
    products_in_stock: number;
    /** Produtos com saída no período e sem estoque livre. */
    out_of_stock_count: number;
    items_count: number;
    expired_items_count: number;
    expiring_items_count: number;
  };
  deliveries: {
    pending_count: number;
    /** Pendentes com item reservado que venceu: a entrega vai falhar. */
    pending_with_expired_items_count: number;
    oldest_pending_at: string | null;
    delivered_count: number;
    delivered_previous_count: number;
  };
  losses: {
    movements_count: number;
    previous_movements_count: number;
    by_reason: { reason: EWriteOffReason | null; movements_count: number }[];
    top_products: IDashboardLossProduct[];
  };
  activity: IDashboardActivityDay[];
  top_delivered: IDashboardTopDelivered[];
  restock: IDashboardRestock[];
  expiration_alerts: IDashboardExpirationAlert[];
}

export type CoverageLevel = 'critical' | 'warning' | 'ok';

/** Cobertura do estoque livre: acabou ou < 3 dias → crítico; < 7 dias → atenção. */
export function coverageLevel(coverageDays: string): CoverageLevel {
  const days = +coverageDays;

  if (days < 3) return 'critical';
  if (days < 7) return 'warning';
  return 'ok';
}

/**
 * Variação percentual contra o período anterior; `null` quando não há base (anterior = 0), para
 * não mostrar "+∞%".
 */
export function trendPercent(current: number, previous: number): number | null {
  if (previous === 0) return null;

  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Marcas do eixo Y para contagens: passo "redondo" (1, 2 ou 5 × 10ⁿ) e pelo menos 4 faixas, de 0 até
 * cobrir `value`. Sempre inteiros (o eixo conta movimentações).
 */
export function axisTicks(value: number, rows = 4): number[] {
  const raw = Math.max(value, rows) / rows;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= raw)!;
  const count = Math.max(Math.ceil(value / step), rows);

  return Array.from({ length: count + 1 }, (_, index) => index * step);
}
