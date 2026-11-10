import { Component, inject, signal } from '@angular/core';
import { AuthStore } from '@/resources/auth/stores/AuthStore';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AttributionFooter } from './AttributionFooter';

/**
 * Casca das telas autenticadas: sidebar em gaveta + header + conteúdo
 * (projetado) + rodapé de atribuição.
 *
 * Ocupa exatamente a viewport e nunca rola: só o `<main>` tem scroll — header,
 * sidebar e rodapé ficam fixos.
 */
@Component({
  selector: 'app-shell',
  imports: [AppHeader, AppSidebar, AttributionFooter],
  // Sem `flex-1`: no `app-root` (`min-h-dvh`), o flex-basis 0 do `flex-1` venceria o `h-dvh`
  // e a casca cresceria com o conteúdo (sidebar), rolando a página inteira.
  host: { class: 'flex h-dvh shrink-0 overflow-hidden' },
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

      <main class="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <ng-content />
      </main>

      <app-attribution-footer />
    </div>
  `,
})
export class AppShell {
  protected readonly authStore = inject(AuthStore);

  protected readonly sidebarOpen = signal(false);
}
