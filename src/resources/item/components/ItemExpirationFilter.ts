import { afterNextRender, Component, type ElementRef, Injector, inject, model, viewChild } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { TranslatePipe } from '@/utils/translate.pipe';
import { EItemExpirationFilter } from '../enums/ItemExpirationFilter';

/**
 * Filtro de validade da lista de itens num controle só: Todos / Vencendo / Vencidos / Data.
 * "Data" abre, colado ao grupo, o campo do vencimento exato (`expiresAt`, `YYYY-MM-DD`).
 */
@Component({
  selector: 'app-item-expiration-filter',
  imports: [HlmInput, HlmToggleGroupImports, NgIcon, TranslatePipe],
  host: { class: 'flex flex-wrap items-stretch' },
  template: `
    <hlm-toggle-group
      type="single"
      variant="outline"
      [nullable]="false"
      [value]="expiration()"
      (valueChange)="select($any($event))"
    >
      <button
        hlmToggleGroupItem
        class="px-4"
        [value]="filters.ALL"
      >
        {{ 'items.filters.expiration.all' | t }}
      </button>

      <button
        hlmToggleGroupItem
        class="px-4"
        [value]="filters.EXPIRING"
      >
        {{ 'items.filters.expiration.expiring' | t }}
      </button>

      <button
        hlmToggleGroupItem
        class="px-4"
        [value]="filters.EXPIRED"
      >
        {{ 'items.filters.expiration.expired' | t }}
      </button>

      <button
        hlmToggleGroupItem
        class="gap-1.5 px-4"
        [value]="filters.DATE"
      >
        <ng-icon
          name="lucideCalendarDays"
          aria-hidden="true"
        />

        {{ 'items.filters.expiration.date' | t }}
      </button>
    </hlm-toggle-group>

    @if (expiration() === filters.DATE) {
      <input
        #dateInput
        hlmInput
        type="date"
        class="-ms-px w-40"
        [attr.aria-label]="'items.filters.expiresAt' | t"
        [attr.title]="'items.filters.expiresAt' | t"
        [value]="expiresAt()"
        (input)="expiresAt.set($any($event.target).value)"
      />
    }
  `,
})
export class ItemExpirationFilter {
  private readonly injector = inject(Injector);

  readonly expiration = model.required<EItemExpirationFilter>();
  readonly expiresAt = model.required<string>();

  protected readonly filters = EItemExpirationFilter;

  private readonly dateInput = viewChild<ElementRef<HTMLInputElement>>('dateInput');

  protected select(next: EItemExpirationFilter | null | undefined) {
    if (!next || next === this.expiration()) return;

    this.expiration.set(next);

    if (next !== EItemExpirationFilter.DATE) {
      this.expiresAt.set('');
      return;
    }

    // Escolheu "Data": já abre o calendário do campo que acabou de aparecer.
    afterNextRender(() => {
      const input = this.dateInput()?.nativeElement;

      input?.focus();

      try {
        input?.showPicker();
      } catch {
        // Navegador sem showPicker (ou sem ativação do usuário): fica só o foco.
      }
    }, { injector: this.injector });
  }
}
