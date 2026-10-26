import { Component, inject, signal } from '@angular/core';
import { AuthStore } from '@/resources/auth/stores/AuthStore';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AttributionFooter } from './AttributionFooter';

/**
 * Casca das telas autenticadas: sidebar em gaveta + header + conteúdo
 * (projetado) + rodapé de atribuição.
 */
@Component({
  selector: 'app-shell',
  imports: [AppHeader, AppSidebar, AttributionFooter],
  host: { class: 'flex flex-1 min-h-0 h-dvh' },
  template: `
    <app-sidebar
      [open]="sidebarOpen()"
      (closed)="sidebarOpen.set(false)"
    />

    <div class="flex flex-col flex-1 min-w-0 min-h-0">
      <app-header
        [user]="authStore.user()"
        [sidebarOpen]="sidebarOpen()"
        (menuClick)="sidebarOpen.set(true)"
      />

      <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <ng-content />
      </div>

      <app-attribution-footer />
    </div>
  `,
})
export class AppShell {
  protected readonly authStore = inject(AuthStore);

  protected readonly sidebarOpen = signal(false);
}
