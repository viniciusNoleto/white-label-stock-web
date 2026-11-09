import { Component, computed, inject, input } from '@angular/core';
import { I18n } from '@/libs/i18n';
import { formatISODate, todayISO } from '@/utils/date';
import { TranslatePipe } from '@/utils/translate.pipe';
import { EExpirationStatus } from '../enums/ExpirationStatus';
import { expirationStatus } from '../models/Item';

/** Vencimento com a cor da situação: vencido (vermelho), vencendo (âmbar), válido (neutro). */
@Component({
  selector: 'app-expiration-badge',
  imports: [TranslatePipe],
  host: { class: 'contents' },
  template: `
    @if (expiresAt(); as date) {
      <span
        class="inline-flex h-6 items-center gap-1.5 border px-2 text-xs font-medium tabular-nums"
        [class]="toneClass()"
        [title]="'items.expiration.' + status() | t"
      >
        {{ formatted() }}

        @if (status() === statuses.EXPIRED) {
          <span>
            · {{ 'items.expiration.expired' | t }}
          </span>
        }
      </span>
    } @else {
      <span class="text-gray-400 dark:text-gray-500">
        {{ 'items.expiration.none' | t }}
      </span>
    }
  `,
})
export class ExpirationBadge {
  private readonly i18n = inject(I18n);

  readonly expiresAt = input<string | null>(null);

  protected readonly statuses = EExpirationStatus;

  protected readonly status = computed(() => expirationStatus(this.expiresAt(), todayISO()));
  protected readonly toneClass = computed(() => ({
    [EExpirationStatus.EXPIRED]: 'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300',
    [EExpirationStatus.EXPIRING]: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    [EExpirationStatus.VALID]: 'border-gray-200 text-gray-700 dark:border-neutral-700 dark:text-gray-300',
    [EExpirationStatus.NONE]: '',
  })[this.status()]);

  protected readonly formatted = computed(() => (this.expiresAt() ? formatISODate(this.expiresAt()!, this.i18n.language()) : ''));
}
