import { DOCUMENT } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { type Params, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FormButton } from '@/components/form/Button';
import { FormSegmentedControl } from '@/components/form/SegmentedControl';
import { PageHeader } from '@/components/layout/PageHeader';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsTable, UtilsTableCell } from '@/components/utils/Table';
import { I18n } from '@/libs/i18n';
import { DashboardActivityChart } from '@/resources/dashboard/components/ActivityChart';
import {
  type CoverageLevel,
  coverageLevel,
  DASHBOARD_PERIODS,
  type DashboardPeriod,
  DEFAULT_DASHBOARD_PERIOD,
  type IDashboard,
  type IDashboardExpirationAlert,
  type IDashboardLossProduct,
  type IDashboardRestock,
  type IDashboardTopDelivered,
  trendPercent,
} from '@/resources/dashboard/models/Dashboard';
import { getDashboardService } from '@/resources/dashboard/services/getDashboard';
import { EItemExpirationFilter } from '@/resources/item/enums/ItemExpirationFilter';
import { EStockMovementType } from '@/resources/stock-movement/enums/StockMovementType';
import { formatISODate } from '@/utils/date';
import { debouncedEffect } from '@/utils/effects';
import { createQuery } from '@/utils/query';
import { injectFilterQueryParams } from '@/utils/query-params';
import { TranslatePipe } from '@/utils/translate.pipe';

/** Atualização automática enquanto a aba está visível. A API serve do cache: chamar sempre é barato. */
const AUTO_REFRESH_MS = 60_000;

type DashboardFilters = { period: DashboardPeriod };

type Kpi = {
  key: string;
  icon: string;
  labelKey: string;
  value: number;
  detail: string;
  link: { path: string; query?: Params };
  trend?: { percent: number | null; previous: number };
};

type Alert = {
  key: string;
  level: 'critical' | 'warning';
  text: string;
  link: { path: string; query?: Params };
};

const ALERT_STYLES: Record<Alert['level'], string> = {
  critical: 'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300',
  warning: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
};

const COVERAGE_STYLES: Record<CoverageLevel, { icon: string; classes: string }> = {
  critical: { icon: 'lucideOctagonAlert', classes: 'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300' },
  warning: { icon: 'lucideTriangleAlert', classes: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300' },
  ok: { icon: 'lucideCircleCheck', classes: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' },
};

/**
 * Página inicial do inventário: o que pede ação agora (alertas, reposição, vencimentos) e como foi o
 * período (entregas, perdas, atividade), com links para as listas já filtradas.
 */
@Component({
  selector: 'app-dashboard-page',
  imports: [
    DashboardActivityChart,
    FormButton,
    FormSegmentedControl,
    NgIcon,
    PageHeader,
    RouterLink,
    TranslatePipe,
    UtilsCard,
    UtilsTable,
    UtilsTableCell,
  ],
  host: { class: 'flex flex-col flex-1' },
  template: `
    <app-page-header
      icon="lucideLayoutDashboard"
      [title]="'dashboard.page.title' | t"
      [subtitle]="'dashboard.page.subtitle' | t"
      [running]="dashboardQuery.isFetching()"
    >
      <div class="flex flex-wrap items-center gap-3">
        @if (dashboard(); as data) {
          <span class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <ng-icon
              name="lucideClock"
              size="14"
            />

            {{ 'dashboard.page.updatedAt' | t: { time: formatTime(data.generated_at) } }}
          </span>
        }

        <app-form-segmented-control
          class="w-64"
          [data]="periodOptions()"
          [value]="filters().period"
          (valueChange)="setPeriod($event)"
        />

        <button
          appButton
          variant="outline"
          size="icon"
          icon="lucideRefreshCw"
          [loading]="dashboardQuery.isFetching()"
          [attr.aria-label]="'dashboard.page.refresh' | t"
          (click)="dashboardQuery.refetch()"
        ></button>
      </div>
    </app-page-header>

    @if (dashboard(); as data) {
      <div class="flex flex-col gap-6 p-4 sm:p-8">
        @if (alerts().length) {
          <ul class="flex flex-col gap-2">
            @for (alert of alerts(); track alert.key) {
              <li>
                <a
                  class="flex items-center gap-3 border px-4 py-3 text-sm transition-colors hover:brightness-95"
                  [class]="alertStyles[alert.level]"
                  [routerLink]="alert.link.path"
                  [queryParams]="alert.link.query"
                >
                  <ng-icon
                    size="18"
                    class="shrink-0"
                    [name]="alert.level === 'critical' ? 'lucideOctagonAlert' : 'lucideTriangleAlert'"
                  />

                  <span class="flex-1">
                    {{ alert.text }}
                  </span>

                  <ng-icon
                    name="lucideArrowRight"
                    size="16"
                    class="shrink-0"
                  />
                </a>
              </li>
            }
          </ul>
        }

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          @for (kpi of kpis(); track kpi.key) {
            <a
              appCard
              class="group flex flex-col gap-3 p-5 transition-colors hover:border-primary-300 dark:hover:border-primary-800"
              [routerLink]="kpi.link.path"
              [queryParams]="kpi.link.query"
            >
              <span class="flex items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
                {{ kpi.labelKey | t }}

                <ng-icon
                  size="18"
                  class="text-gray-400 group-hover:text-primary-500 dark:text-gray-500"
                  [name]="kpi.icon"
                />
              </span>

              <span class="text-3xl font-semibold tabular-nums tracking-tight text-gray-900 dark:text-gray-100">
                {{ formatCount(kpi.value) }}
              </span>

              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ kpi.detail }}
              </span>

              @if (kpi.trend; as trend) {
                <span class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                  <ng-icon
                    size="14"
                    [name]="trend.percent === null || trend.percent === 0 ? 'lucideMinus' : trend.percent > 0 ? 'lucideTrendingUp' : 'lucideTrendingDown'"
                  />

                  @if (trend.percent === null) {
                    {{ 'dashboard.trend.noBase' | t: { previous: trend.previous } }}
                  } @else {
                    {{ 'dashboard.trend.vsPrevious' | t: { percent: formatPercent(trend.percent), previous: trend.previous } }}
                  }
                </span>
              }
            </a>
          }
        </div>

        <section
          appCard
          class="flex flex-col gap-4"
        >
          <div class="flex flex-col gap-1">
            <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
              {{ 'dashboard.activity.title' | t }}
            </h2>

            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ 'dashboard.activity.subtitle' | t: { from: formatDate(data.period.from), to: formatDate(data.period.to) } }}
            </p>
          </div>

          <app-dashboard-activity-chart [days]="data.activity" />
        </section>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section
            appCard
            noPadding
            class="flex flex-col"
          >
            <div class="flex flex-col gap-1 px-6 pt-6 pb-4">
              <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                {{ 'dashboard.restock.title' | t }}
              </h2>

              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ 'dashboard.restock.subtitle' | t: { days: data.period.days } }}
              </p>
            </div>

            <app-utils-table
              [rows]="data.restock"
              [rowKey]="restockRowKey"
              [numbered]="false"
              [emptyText]="'dashboard.restock.empty' | t"
              [columns]="{
                product_name: 'dashboard.columns.product' | t,
                free_quantity: 'dashboard.restock.columns.free' | t,
                daily_outflow: 'dashboard.restock.columns.dailyOutflow' | t,
                coverage_days: 'dashboard.restock.columns.coverage' | t,
              }"
            >
              <ng-template
                appTableCell="product_name"
                [appTableCellOf]="data.restock"
                let-row
              >
                <a
                  class="font-medium text-gray-900 hover:text-primary-600 hover:underline dark:text-gray-100 dark:hover:text-primary-300"
                  routerLink="/inventory/items"
                  [queryParams]="{ product: row.product_id }"
                >
                  {{ row.product_name }}
                </a>
              </ng-template>

              <ng-template
                appTableCell="free_quantity"
                [appTableCellOf]="data.restock"
                let-row
              >
                <span class="tabular-nums">
                  {{ formatQuantity(row.free_quantity, row.unit_abbreviation) }}
                </span>
              </ng-template>

              <ng-template
                appTableCell="daily_outflow"
                [appTableCellOf]="data.restock"
                let-row
              >
                <span class="tabular-nums">
                  {{ formatQuantity(row.daily_outflow, row.unit_abbreviation) }}
                </span>
              </ng-template>

              <ng-template
                appTableCell="coverage_days"
                [appTableCellOf]="data.restock"
                let-row
              >
                @let level = coverageOf(row);

                <span
                  class="inline-flex h-6 items-center gap-1.5 border px-2 text-xs font-medium whitespace-nowrap"
                  [class]="coverageStyles[level].classes"
                >
                  <ng-icon
                    size="13"
                    [name]="coverageStyles[level].icon"
                  />

                  {{ coverageText(row) }}
                </span>
              </ng-template>
            </app-utils-table>
          </section>

          <section
            appCard
            noPadding
            class="flex flex-col"
          >
            <div class="flex flex-col gap-1 px-6 pt-6 pb-4">
              <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                {{ 'dashboard.expiration.title' | t }}
              </h2>

              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ 'dashboard.expiration.subtitle' | t }}
              </p>
            </div>

            <app-utils-table
              [rows]="data.expiration_alerts"
              [rowKey]="expirationRowKey"
              [numbered]="false"
              [emptyText]="'dashboard.expiration.empty' | t"
              [columns]="{
                product_name: 'dashboard.columns.product' | t,
                expired_quantity: 'dashboard.expiration.columns.expired' | t,
                expiring_quantity: 'dashboard.expiration.columns.expiring' | t,
                next_expires_at: 'dashboard.expiration.columns.next' | t,
              }"
            >
              <ng-template
                appTableCell="product_name"
                [appTableCellOf]="data.expiration_alerts"
                let-row
              >
                <a
                  class="font-medium text-gray-900 hover:text-primary-600 hover:underline dark:text-gray-100 dark:hover:text-primary-300"
                  routerLink="/inventory/items"
                  [queryParams]="{ product: row.product_id, expiration: +row.expired_quantity > 0 ? expirationFilters.EXPIRED : expirationFilters.EXPIRING }"
                >
                  {{ row.product_name }}
                </a>
              </ng-template>

              <ng-template
                appTableCell="expired_quantity"
                [appTableCellOf]="data.expiration_alerts"
                let-row
              >
                <span
                  class="tabular-nums"
                  [class]="+row.expired_quantity > 0 ? 'font-semibold text-red-700 dark:text-red-300' : ''"
                >
                  {{ +row.expired_quantity > 0 ? formatQuantity(row.expired_quantity, row.unit_abbreviation) : '—' }}
                </span>
              </ng-template>

              <ng-template
                appTableCell="expiring_quantity"
                [appTableCellOf]="data.expiration_alerts"
                let-row
              >
                <span class="tabular-nums">
                  {{ +row.expiring_quantity > 0 ? formatQuantity(row.expiring_quantity, row.unit_abbreviation) : '—' }}
                </span>
              </ng-template>

              <ng-template
                appTableCell="next_expires_at"
                [appTableCellOf]="data.expiration_alerts"
                let-row
              >
                <span class="tabular-nums">
                  {{ row.next_expires_at ? formatDate(row.next_expires_at) : '—' }}
                </span>
              </ng-template>
            </app-utils-table>
          </section>

          <section
            appCard
            noPadding
            class="flex flex-col"
          >
            <div class="flex flex-col gap-1 px-6 pt-6 pb-4">
              <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                {{ 'dashboard.topDelivered.title' | t }}
              </h2>

              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ 'dashboard.topDelivered.subtitle' | t: { days: data.period.days } }}
              </p>
            </div>

            <app-utils-table
              [rows]="data.top_delivered"
              [rowKey]="topDeliveredRowKey"
              [emptyText]="'dashboard.topDelivered.empty' | t"
              [columns]="{
                product_name: 'dashboard.columns.product' | t,
                packages_count: 'dashboard.topDelivered.columns.packages' | t,
                quantity: 'dashboard.columns.quantity' | t,
              }"
            >
              <ng-template
                appTableCell="packages_count"
                [appTableCellOf]="data.top_delivered"
                let-row
              >
                <span class="tabular-nums">
                  {{ formatCount(row.packages_count) }}
                </span>
              </ng-template>

              <ng-template
                appTableCell="quantity"
                [appTableCellOf]="data.top_delivered"
                let-row
              >
                <span class="tabular-nums">
                  {{ formatQuantity(row.quantity, row.unit_abbreviation) }}
                </span>
              </ng-template>
            </app-utils-table>
          </section>

          <section
            appCard
            noPadding
            class="flex flex-col"
          >
            <div class="flex flex-col gap-1 px-6 pt-6 pb-4">
              <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                {{ 'dashboard.losses.title' | t }}
              </h2>

              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ 'dashboard.losses.subtitle' | t: { days: data.period.days } }}
              </p>
            </div>

            @if (data.losses.by_reason.length) {
              <ul class="flex flex-col gap-2 px-6 pb-4">
                @for (reason of lossReasons(); track reason.key) {
                  <li class="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-sm">
                    <span class="truncate text-gray-600 dark:text-gray-400">
                      {{ reason.label }}
                    </span>

                    <span
                      aria-hidden="true"
                      class="h-2 bg-gray-100 dark:bg-neutral-800"
                    >
                      <span
                        class="block h-full rounded-r bg-primary-500 dark:bg-primary-400"
                        [style.width.%]="reason.share"
                      ></span>
                    </span>

                    <span class="font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                      {{ formatCount(reason.count) }}
                    </span>
                  </li>
                }
              </ul>
            }

            <app-utils-table
              [rows]="data.losses.top_products"
              [rowKey]="lossRowKey"
              [emptyText]="'dashboard.losses.empty' | t"
              [columns]="{
                product_name: 'dashboard.columns.product' | t,
                movements_count: 'dashboard.losses.columns.writeOffs' | t,
                quantity: 'dashboard.columns.quantity' | t,
              }"
            >
              <ng-template
                appTableCell="movements_count"
                [appTableCellOf]="data.losses.top_products"
                let-row
              >
                <span class="tabular-nums">
                  {{ formatCount(row.movements_count) }}

                  @if (row.expired_count) {
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ 'dashboard.losses.expiredShare' | t: { count: row.expired_count } }}
                    </span>
                  }
                </span>
              </ng-template>

              <ng-template
                appTableCell="quantity"
                [appTableCellOf]="data.losses.top_products"
                let-row
              >
                <span class="tabular-nums">
                  {{ formatQuantity(row.quantity, row.unit_abbreviation) }}
                </span>
              </ng-template>
            </app-utils-table>
          </section>
        </div>
      </div>
    } @else if (dashboardQuery.error()) {
      <section
        appCard
        class="m-4 flex flex-col items-start gap-4 sm:m-8"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ 'dashboard.page.error' | t }}
        </p>

        <button
          appButton
          variant="outline"
          leftIcon="lucideRefreshCw"
          (click)="dashboardQuery.refetch()"
        >
          {{ 'dashboard.page.retry' | t }}
        </button>
      </section>
    }
  `,
})
export class DashboardPage {
  private readonly i18n = inject(I18n);
  private readonly document = inject(DOCUMENT);

  protected readonly alertStyles = ALERT_STYLES;
  protected readonly coverageStyles = COVERAGE_STYLES;
  protected readonly expirationFilters = EItemExpirationFilter;

  private readonly filterParams = injectFilterQueryParams<DashboardFilters>({
    read: (params) => {
      const period = Number(params.get('period'));

      return { period: (DASHBOARD_PERIODS as readonly number[]).includes(period) ? (period as DashboardPeriod) : DEFAULT_DASHBOARD_PERIOD };
    },
    write: (filters) => ({ period: filters.period === DEFAULT_DASHBOARD_PERIOD ? null : filters.period }),
  });

  protected readonly filters = signal<DashboardFilters>(this.filterParams.initial);

  protected readonly dashboardQuery = createQuery({
    queryFn: () => getDashboardService({ query: { period: this.filters().period } }),
  });

  /** Mantém os números anteriores na tela enquanto atualiza (sem piscar a página inteira). */
  protected readonly dashboard = computed<IDashboard | undefined>(() => this.dashboardQuery.data()?.data);

  protected readonly periodOptions = computed(() => DASHBOARD_PERIODS.map((days) => ({ value: days, label: this.i18n.t('dashboard.period.days', { count: days }) })));

  private readonly countFormatter = computed(() => new Intl.NumberFormat(this.i18n.language()));
  private readonly quantityFormatter = computed(() => new Intl.NumberFormat(this.i18n.language(), { maximumFractionDigits: 2 }));
  private readonly daysFormatter = computed(() => new Intl.NumberFormat(this.i18n.language(), { maximumFractionDigits: 1 }));
  private readonly timeFormatter = computed(() => new Intl.DateTimeFormat(this.i18n.language(), { timeStyle: 'short' }));
  private readonly dateTimeFormatter = computed(() => new Intl.DateTimeFormat(this.i18n.language(), { dateStyle: 'short', timeStyle: 'short' }));

  protected readonly kpis = computed<Kpi[]>(() => {
    const data = this.dashboard();
    if (!data) return [];

    const { stock, deliveries, losses, period } = data;
    const movementsLink = { from: period.from, to: period.to };

    return [
      {
        key: 'items',
        icon: 'lucideBoxes',
        labelKey: 'dashboard.kpis.items',
        value: stock.items_count,
        detail: this.i18n.t('dashboard.kpis.itemsDetail', { inStock: stock.products_in_stock, total: stock.products_count }),
        link: { path: '/inventory/stock' },
      },
      {
        key: 'expiring',
        icon: 'lucideCalendarDays',
        labelKey: 'dashboard.kpis.expiring',
        value: stock.expiring_items_count,
        detail: this.i18n.t('dashboard.kpis.expiringDetail', { count: stock.expired_items_count }),
        link: { path: '/inventory/items', query: { expiration: EItemExpirationFilter.EXPIRING } },
      },
      {
        key: 'pending',
        icon: 'lucidePackage',
        labelKey: 'dashboard.kpis.pending',
        value: deliveries.pending_count,
        detail: deliveries.oldest_pending_at
          ? this.i18n.t('dashboard.kpis.pendingSince', { date: this.dateTimeFormatter().format(new Date(deliveries.oldest_pending_at)) })
          : this.i18n.t('dashboard.kpis.pendingNone'),
        link: { path: '/inventory/deliveries' },
      },
      {
        key: 'delivered',
        icon: 'lucidePackageCheck',
        labelKey: 'dashboard.kpis.delivered',
        value: deliveries.delivered_count,
        detail: this.i18n.t('dashboard.kpis.inPeriod', { count: period.days }),
        link: { path: '/inventory/movements', query: { ...movementsLink, type: EStockMovementType.DELIVERY } },
        trend: { percent: trendPercent(deliveries.delivered_count, deliveries.delivered_previous_count), previous: deliveries.delivered_previous_count },
      },
      {
        key: 'losses',
        icon: 'lucideTrash2',
        labelKey: 'dashboard.kpis.losses',
        value: losses.movements_count,
        detail: this.i18n.t('dashboard.kpis.inPeriod', { count: period.days }),
        link: { path: '/inventory/movements', query: { ...movementsLink, type: EStockMovementType.WRITE_OFF } },
        trend: { percent: trendPercent(losses.movements_count, losses.previous_movements_count), previous: losses.previous_movements_count },
      },
    ];
  });

  /** O que pede ação agora, do mais grave ao menos grave. */
  protected readonly alerts = computed<Alert[]>(() => {
    const data = this.dashboard();
    if (!data) return [];

    const alerts: Alert[] = [];
    const { deliveries, stock } = data;

    if (deliveries.pending_with_expired_items_count > 0) {
      alerts.push({
        key: 'packagesWithExpired',
        level: 'critical',
        text: this.i18n.t('dashboard.alerts.packagesWithExpired', { count: deliveries.pending_with_expired_items_count }),
        link: { path: '/inventory/deliveries' },
      });
    }

    if (stock.out_of_stock_count > 0) {
      alerts.push({
        key: 'outOfStock',
        level: 'critical',
        text: this.i18n.t('dashboard.alerts.outOfStock', { count: stock.out_of_stock_count }),
        link: { path: '/inventory/stock' },
      });
    }

    if (stock.expired_items_count > 0) {
      alerts.push({
        key: 'expired',
        level: 'warning',
        text: this.i18n.t('dashboard.alerts.expired', { count: stock.expired_items_count }),
        link: { path: '/inventory/items', query: { expiration: EItemExpirationFilter.EXPIRED } },
      });
    }

    return alerts;
  });

  protected readonly lossReasons = computed(() => {
    const byReason = this.dashboard()?.losses.by_reason ?? [];
    const max = Math.max(1, ...byReason.map((row) => row.movements_count));

    return byReason.map((row) => ({
      key: row.reason ?? 'none',
      label: this.i18n.t(row.reason ? `movements.reasons.${row.reason}` : 'movements.reasons.none'),
      count: row.movements_count,
      share: (row.movements_count / max) * 100,
    }));
  });

  protected readonly restockRowKey = ({ item }: { item: IDashboardRestock }) => item.product_id;
  protected readonly expirationRowKey = ({ item }: { item: IDashboardExpirationAlert }) => item.product_id;
  protected readonly topDeliveredRowKey = ({ item }: { item: IDashboardTopDelivered }) => `${item.product_id}-${item.product_name}-${item.unit_abbreviation}`;
  protected readonly lossRowKey = ({ item }: { item: IDashboardLossProduct }) => `${item.product_id}-${item.product_name}-${item.unit_abbreviation}`;

  constructor() {
    this.filterParams.bind(this.filters);

    // Troca de período (botões ou URL): busca de novo.
    debouncedEffect(this.filters, () => this.dashboardQuery.refetch(), 0);

    const destroyRef = inject(DestroyRef);

    const autoRefresh = setInterval(() => {
      if (this.document.visibilityState === 'visible') this.dashboardQuery.refetch();
    }, AUTO_REFRESH_MS);

    const onVisible = () => {
      if (this.document.visibilityState === 'visible') this.dashboardQuery.refetch();
    };
    this.document.addEventListener('visibilitychange', onVisible);

    destroyRef.onDestroy(() => {
      clearInterval(autoRefresh);
      this.document.removeEventListener('visibilitychange', onVisible);
    });
  }

  protected setPeriod(value: unknown) {
    const period = Number(value) as DashboardPeriod;
    if (!DASHBOARD_PERIODS.includes(period) || period === this.filters().period) return;

    this.filters.set({ period });
    this.filterParams.save({ period });
  }

  protected coverageOf(row: IDashboardRestock): CoverageLevel {
    return coverageLevel(row.coverage_days);
  }

  protected coverageText(row: IDashboardRestock): string {
    return +row.coverage_days <= 0
      ? this.i18n.t('dashboard.restock.coverageNone')
      : this.i18n.t('dashboard.restock.coverageDays', { days: this.daysFormatter().format(+row.coverage_days) });
  }

  protected formatCount(value: number): string {
    return this.countFormatter().format(value);
  }

  protected formatQuantity(value: string, unit: string | null): string {
    const quantity = this.quantityFormatter().format(+value);

    return unit ? `${quantity} ${unit}` : quantity;
  }

  protected formatPercent(percent: number): string {
    return `${percent > 0 ? '+' : ''}${this.countFormatter().format(percent)}%`;
  }

  protected formatDate(date: string): string {
    return formatISODate(date, this.i18n.language());
  }

  protected formatTime(iso: string): string {
    return this.timeFormatter().format(new Date(iso));
  }
}
