import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, output, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '@/utils/translate.pipe';
import { BrandMark } from './BrandMark';

const NAV_ITEMS = [
  { href: '/inventory/items', icon: 'lucidePackage', labelKey: 'sidebar.items' },
  { href: '/inventory/categories', icon: 'lucideTag', labelKey: 'sidebar.categories' },
  { href: '/inventory/units', icon: 'lucideRuler', labelKey: 'sidebar.units' },
  { href: '/inventory/storages', icon: 'lucideWarehouse', labelKey: 'sidebar.storages' },
] as const;

/** Mesmo breakpoint do `lg:` do Tailwind. */
const DESKTOP_MEDIA_QUERY = '(min-width: 64rem)';

/**
 * Menu lateral: fixo ao lado do conteúdo a partir de `lg`; abaixo disso vira
 * gaveta, aberta por cima do conteúdo pelo botão de menu do header.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon, TranslatePipe, BrandMark],
  host: {
    class: 'contents',
    '(document:keydown.escape)': 'open() && closed.emit()',
  },
  template: `
    <div
      class="fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden"
      [class.opacity-100]="open()"
      [class.pointer-events-auto]="open()"
      [class.opacity-0]="!open()"
      [class.pointer-events-none]="!open()"
      aria-hidden="true"
      (click)="closed.emit()"
    ></div>

    <aside
      id="app-sidebar"
      class="fixed inset-y-0 left-0 z-50 flex flex-col w-64 shrink-0 overflow-y-auto bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:translate-x-0"
      [class.translate-x-0]="open()"
      [class.-translate-x-full]="!open()"
      [attr.inert]="hidden() ? '' : null"
      [attr.aria-label]="'sidebar.section' | t"
    >
      <div class="flex items-center justify-between gap-2 h-16 shrink-0 px-5 border-b border-gray-200 dark:border-gray-800">
        <a
          routerLink="/"
          class="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          (click)="closed.emit()"
        >
          <app-brand-mark />
        </a>

        <button
          type="button"
          class="flex items-center justify-center size-8 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 lg:hidden"
          [attr.aria-label]="'common.actions.close' | t"
          (click)="closed.emit()"
        >
          <ng-icon name="lucideX" />
        </button>
      </div>

      <nav class="flex flex-col gap-1 px-3 pt-5">
        <p class="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
          {{ 'sidebar.section' | t }}
        </p>

        @for (item of navItems; track item.href) {
          <a
            class="group flex items-center gap-3 h-9 px-3 rounded-lg text-[14.5px] transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-neutral-800"
            routerLinkActive="bg-primary-500/10! font-medium text-primary-700! dark:text-primary-300!"
            ariaCurrentWhenActive="page"
            [routerLink]="item.href"
            (click)="closed.emit()"
          >
            <ng-icon
              size="18"
              class="shrink-0 text-gray-500 dark:text-gray-400 group-aria-[current=page]:text-primary-600 dark:group-aria-[current=page]:text-primary-300"
              [name]="item.icon"
            />

            <span class="flex-1 truncate">
              {{ item.labelKey | t }}
            </span>
          </a>
        }
      </nav>
    </aside>
  `,
})
export class AppSidebar {
  private readonly document = inject(DOCUMENT);

  readonly open = input(false);
  readonly closed = output<void>();

  protected readonly navItems = NAV_ITEMS;

  private readonly isDesktop = signal(false);

  /** Gaveta fechada (só abaixo de `lg`) — fica fora da navegação por teclado. */
  protected readonly hidden = computed(() => !this.isDesktop() && !this.open());

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    const media = this.document.defaultView?.matchMedia(DESKTOP_MEDIA_QUERY);

    if (media) {
      this.isDesktop.set(media.matches);

      const listener = (event: MediaQueryListEvent) => {
        this.isDesktop.set(event.matches);

        if (event.matches && this.open()) this.closed.emit();
      };
      media.addEventListener('change', listener);
      inject(DestroyRef).onDestroy(() => media.removeEventListener('change', listener));
    }
  }
}
