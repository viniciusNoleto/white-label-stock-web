import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShell } from '@/components/layout/AppShell';

@Component({
  selector: 'app-inventory-layout',
  imports: [AppShell, RouterOutlet],
  host: { class: 'contents' },
  template: `
    <app-shell>
      <router-outlet />
    </app-shell>
  `,
})
export class InventoryLayout {}
