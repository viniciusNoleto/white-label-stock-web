import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '@/utils/translate.pipe';
import { EStockMovementType } from '../enums/StockMovementType';

const TYPE_STYLE: Record<EStockMovementType, { icon: string; tone: string }> = {
  [EStockMovementType.ENTRY]: {
    icon: 'lucidePackagePlus',
    tone: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  [EStockMovementType.PRODUCTION]: {
    icon: 'lucideFactory',
    tone: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  [EStockMovementType.CONSUMPTION]: {
    icon: 'lucideHammer',
    tone: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  },
  [EStockMovementType.ADJUSTMENT]: {
    icon: 'lucideArrowUpDown',
    tone: 'border-gray-300 bg-gray-50 text-gray-800 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-gray-200',
  },
  [EStockMovementType.TRANSFER]: {
    icon: 'lucideWarehouse',
    tone: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300',
  },
  [EStockMovementType.DELIVERY]: {
    icon: 'lucideTruck',
    tone: 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-900 dark:bg-primary-950/50 dark:text-primary-300',
  },
  [EStockMovementType.WRITE_OFF]: {
    icon: 'lucideTrash2',
    tone: 'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300',
  },
};

/** Tipo da movimentação com ícone e cor: entradas em verde, saídas em âmbar/azul/vermelho. */
@Component({
  selector: 'app-stock-movement-type-badge',
  imports: [NgIcon, TranslatePipe],
  host: { class: 'contents' },
  template: `
    <span
      class="inline-flex h-6 items-center gap-1.5 border px-2 text-xs font-medium whitespace-nowrap"
      [class]="style().tone"
    >
      <ng-icon
        size="13"
        aria-hidden="true"
        [name]="style().icon"
      />

      {{ 'movements.types.' + type() | t }}
    </span>
  `,
})
export class StockMovementTypeBadge {
  readonly type = input.required<EStockMovementType>();

  protected readonly style = computed(() => TYPE_STYLE[this.type()]);
}
