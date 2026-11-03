import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChild, input, output, TemplateRef } from '@angular/core';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

const MODAL_MAX_WIDTH = {
  sm: '32rem',
  md: '40rem',
  lg: '52rem',
  xl: '64rem',
} as const;

/**
 * Modal controlado (substitui o `Modal` do Mantine):
 *
 * ```html
 * <app-utils-modal
 *   [opened]="modals().createUnit"
 *   [title]="'inventory.modals.createUnit' | t"
 *   size="sm"
 *   (closed)="closeModal('createUnit')"
 * >
 *   <ng-template>
 *     <app-create-unit-logic … />
 *   </ng-template>
 * </app-utils-modal>
 * ```
 *
 * O conteúdo vai sempre dentro de `<ng-template>`: só é criado ao abrir e é
 * destruído ao fechar.
 */
@Component({
  selector: 'app-utils-modal',
  imports: [HlmDialogImports, NgTemplateOutlet],
  template: `
    <hlm-dialog
      [state]="opened() ? 'open' : 'closed'"
      (closed)="closed.emit()"
    >
      <hlm-dialog-content
        *hlmDialogPortal="let ctx"
        class="overflow-hidden border border-gray-200 p-6 pt-9 text-base ring-0 shadow-xl sm:p-8 sm:pt-10 dark:border-neutral-800"
        [style.width]="width()"
        [style.max-width]="width()"
      >
        <!-- Faixa de sinalização no topo, como o card de login. -->
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-1.5 bg-hazard-stripes"
        ></span>

        <hlm-dialog-header>
          <h2
            hlmDialogTitle
            class="pr-8 text-xl font-semibold tracking-tight sm:text-2xl"
          >
            {{ title() }}
          </h2>
        </hlm-dialog-header>

        @if (content(); as template) {
          <ng-container *ngTemplateOutlet="template" />
        }
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class UtilsModal {
  readonly opened = input(false);
  readonly title = input('');
  readonly size = input<keyof typeof MODAL_MAX_WIDTH>('md');
  readonly closed = output<void>();

  protected readonly content = contentChild(TemplateRef);

  // Largura fixa (e não só máxima): o painel do overlay encolhe para o conteúdo,
  // então `w-full` sozinho deixava o modal estreito. Em telas pequenas, 100vw - 2rem.
  protected readonly width = computed(() => `min(${MODAL_MAX_WIDTH[this.size()]}, calc(100vw - 2rem))`);
}
