import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, output, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthStore } from '@/resources/auth/stores/AuthStore';
import { TranslatePipe } from '@/utils/translate.pipe';
import { BrandMark } from './BrandMark';

/** Operação do dia a dia (estoque e expedição) separada dos cadastros de apoio. */
const NAV_GROUPS = [
  {
    labelKey: 'sidebar.groups.operation',
    items: [
      { href: '/inventory/stock', icon: 'lucideLayers', labelKey: 'sidebar.stock' },
      { href: '/inventory/items', icon: 'lucideScanBarcode', labelKey: 'sidebar.items' },
      { href: '/inventory/deliveries', icon: 'lucideTruck', labelKey: 'sidebar.deliveries' },
    ],
  },
  {
    labelKey: 'sidebar.groups.registry',
    items: [
      { href: '/inventory/products', icon: 'lucideBox', labelKey: 'sidebar.products' },
      { href: '/inventory/categories', icon: 'lucideTag', labelKey: 'sidebar.categories' },
      { href: '/inventory/units', icon: 'lucideRuler', labelKey: 'sidebar.units' },
      { href: '/inventory/storages', icon: 'lucideWarehouse', labelKey: 'sidebar.storages' },
    ],
  },
] as const;

/** Só para admins: fila de pedidos de cadastro e usuários com acesso. */
const ADMIN_NAV_GROUP = {
  labelKey: 'sidebar.groups.admin',
  items: [
    { href: '/inventory/registration-requests', icon: 'lucideUserPlus', labelKey: 'sidebar.registrationRequests' },
    { href: '/inventory/users', icon: 'lucideUsers', labelKey: 'sidebar.users' },
  ],
} as const;

/** Caixinhas da esteira do rodapé: saem em dupla e somem por ~11 s até a próxima leva. */
const PARCELS = [
  { width: 12, height: 10, delay: 2 },
  { width: 9, height: 7, delay: 3.6 },
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
      class="fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:translate-x-0 dark:border-neutral-800 dark:bg-neutral-900"
      [class.translate-x-0]="open()"
      [class.-translate-x-full]="!open()"
      [attr.inert]="hidden() ? '' : null"
      [attr.aria-label]="'sidebar.section' | t"
    >
      <div class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-5 dark:border-neutral-800">
        <a
          routerLink="/"
          class="outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          (click)="closed.emit()"
        >
          <app-brand-mark />
        </a>

        <button
          type="button"
          class="flex size-8 items-center justify-center text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-neutral-800"
          [attr.aria-label]="'common.actions.close' | t"
          (click)="closed.emit()"
        >
          <ng-icon name="lucideX" />
        </button>
      </div>

      <nav class="flex flex-1 flex-col gap-7 pt-6">
        @for (group of navGroups(); track group.labelKey) {
          <div class="flex flex-col gap-1">
            <p class="px-5 pb-1.5 text-[13px] text-gray-500 dark:text-gray-400">
              {{ group.labelKey | t }}
            </p>

            @for (item of group.items; track item.href) {
              <a
                class="group relative flex h-10 items-center gap-3 px-5 text-[15px] text-gray-700 outline-none transition-colors hover:bg-stone-50 hover:text-gray-950 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 dark:text-gray-300 dark:hover:bg-neutral-800/60 dark:hover:text-white"
                routerLinkActive="bg-primary-500/8! font-medium text-primary-700! dark:bg-primary-500/15! dark:text-primary-200!"
                ariaCurrentWhenActive="page"
                [routerLink]="item.href"
                (click)="closed.emit()"
              >
                <!-- Filete reto marcando a estação ativa. -->
                <span
                  aria-hidden="true"
                  class="absolute inset-y-0 left-0 w-[3px] bg-transparent group-aria-[current=page]:bg-primary-500"
                ></span>

                <ng-icon
                  size="18"
                  class="shrink-0 text-gray-500 group-aria-[current=page]:text-primary-600 dark:text-gray-400 dark:group-aria-[current=page]:text-primary-300"
                  [name]="item.icon"
                />

                <!-- No hover só o texto se move; ícone e fundo ficam parados. -->
                <span class="flex-1 truncate transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                  {{ item.labelKey | t }}
                </span>
              </a>
            }
          </div>
        }
      </nav>

      <!-- Fim da linha: esteira estreita com caixinhas passando de tempos em tempos. -->
      <div
        aria-hidden="true"
        class="mt-8 flex shrink-0 flex-col"
      >
        <div class="relative h-3 overflow-hidden">
          @for (parcel of parcels; track $index) {
            <span
              class="absolute bottom-0 block border border-primary-400 bg-primary-200 animate-sidebar-parcel dark:border-primary-700 dark:bg-primary-900"
              [style.width.px]="parcel.width"
              [style.height.px]="parcel.height"
              [style.animation-delay.s]="parcel.delay"
            ></span>
          }
        </div>

        <div class="h-1.5 border-y border-stone-400/60 bg-conveyor-belt animate-conveyor-belt dark:border-neutral-700"></div>

        <div class="h-1 bg-hazard-stripes opacity-60"></div>
      </div>
    </aside>
  `,
})
export class AppSidebar {
  private readonly document = inject(DOCUMENT);

  readonly open = input(false);
  readonly closed = output<void>();

  private readonly authStore = inject(AuthStore);

  protected readonly navGroups = computed(() => (this.authStore.user()?.is_admin ? [...NAV_GROUPS, ADMIN_NAV_GROUP] : NAV_GROUPS));
  protected readonly parcels = PARCELS;

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
