import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChild, input, output, TemplateRef } from '@angular/core';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

const MODAL_MAX_WIDTH = {
  sm: '24rem',
  md: '32rem',
  lg: '42rem',
  xl: '56rem',
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
        class="w-full"
        [style.max-width]="maxWidth()"
      >
        <hlm-dialog-header>
          <h2
            hlmDialogTitle
            class="text-xl font-semibold"
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

  protected readonly maxWidth = computed(() => `min(${MODAL_MAX_WIDTH[this.size()]}, calc(100% - 2rem))`);
}
