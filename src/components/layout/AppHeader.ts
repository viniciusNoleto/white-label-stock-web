import { Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { type ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { filter, map } from 'rxjs';
import { FormButton } from '@/components/form/Button';
import { injectLogoutLogicData } from '@/resources/auth/logics/Logout';
import type { IAuthUser } from '@/resources/auth/models/AuthUser';
import { TranslatePipe } from '@/utils/translate.pipe';
import { ColorSchemeSwitcher } from './ColorSchemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';

/** Chave de tradução do `title` da rota ativa mais profunda. */
function currentTitleKey(route: ActivatedRouteSnapshot): string | undefined {
  let title = route.title;

  while (route.firstChild) {
    route = route.firstChild;
    title = route.title ?? title;
  }

  return title;
}

@Component({
  selector: 'app-header',
  imports: [FormButton, HlmTooltip, HlmPopoverImports, NgIcon, RouterLink, TranslatePipe, ColorSchemeSwitcher, LanguageSwitcher],
  template: `
    <header class="flex items-center justify-between gap-4 h-16 shrink-0 px-4 sm:px-8 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div class="flex items-center gap-3 min-w-0">
        <button
          appButton
          variant="ghost"
          size="icon"
          class="lg:hidden"
          icon="lucideMenu"
          aria-controls="app-sidebar"
          [attr.aria-expanded]="sidebarOpen()"
          [attr.aria-label]="'header.menu' | t"
          [hlmTooltip]="'header.menu' | t"
          (click)="menuClick.emit()"
        ></button>

        <nav
          class="min-w-0"
          [attr.aria-label]="'header.breadcrumb' | t"
        >
          <ol class="flex items-center gap-1.5 text-sm">
            <li class="hidden sm:flex items-center gap-1.5">
              <a
                routerLink="/dashboard"
                class="rounded text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                {{ 'sidebar.section' | t }}
              </a>

              <ng-icon
                size="14"
                class="text-gray-400 dark:text-gray-500"
                name="lucideChevronRight"
                aria-hidden="true"
              />
            </li>

            @if (titleKey(); as titleKey) {
              <li
                class="font-medium text-gray-900 dark:text-gray-100 truncate"
                aria-current="page"
              >
                {{ titleKey | t }}
              </li>
            }
          </ol>
        </nav>
      </div>

      <div class="flex items-center gap-2.5 ml-auto">
        <app-language-switcher />

        <app-color-scheme-switcher />

        <hlm-popover
          align="end"
          sideOffset="8"
        >
          <button
            hlmPopoverTrigger
            type="button"
            class="flex items-center gap-2.5 h-9 pl-1 pr-1 sm:pr-3 border border-gray-200 dark:border-gray-700 outline-none hover:bg-gray-100/70 dark:hover:bg-neutral-800 aria-expanded:bg-gray-100/70 dark:aria-expanded:bg-neutral-800 focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
            [attr.aria-label]="'header.userMenu' | t"
          >
            <span class="center-flex shrink-0 size-7 bg-primary-500 text-xs font-semibold text-white">
              {{ initial() }}
            </span>

            <span class="hidden sm:block max-w-40 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {{ user()?.name }}
            </span>
          </button>

          <hlm-popover-content
            *hlmPopoverPortal="let ctx"
            class="flex flex-col gap-3 w-60 p-3"
          >
            <div class="min-w-0 px-1">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {{ user()?.name }}
              </div>

              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ user()?.email }}
              </div>

              @if (user()?.is_admin) {
                <span class="mt-2 inline-flex h-6 items-center gap-1.5 border border-primary-300 bg-primary-50 px-2 text-xs font-medium text-primary-800 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-200">
                  <ng-icon
                    name="lucideShieldCheck"
                    size="13"
                    aria-hidden="true"
                  />

                  {{ 'users.roles.admin' | t }}
                </span>
              }
            </div>

            <button
              appButton
              variant="outline"
              class="w-full"
              leftIcon="lucideLogOut"
              [loading]="logoutLogicData.logoutMutation.isPending()"
              (click)="logoutLogicData.logoutMutation.mutate()"
            >
              {{ 'header.logout' | t }}
            </button>
          </hlm-popover-content>
        </hlm-popover>
      </div>
    </header>
  `,
})
export class AppHeader {
  private readonly router = inject(Router);

  readonly user = input<IAuthUser | null>(null);
  readonly sidebarOpen = input(false);
  readonly menuClick = output<void>();

  protected readonly titleKey = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => currentTitleKey(this.router.routerState.snapshot.root)),
    ),
    { initialValue: currentTitleKey(this.router.routerState.snapshot.root) },
  );

  protected readonly initial = computed(() => this.user()?.name.trim()[0]?.toUpperCase() ?? '');

  protected readonly logoutLogicData = injectLogoutLogicData({
    onSuccess: () => this.router.navigateByUrl('/auth/login'),
  });
}
