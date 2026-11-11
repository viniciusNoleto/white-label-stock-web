import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthScene } from '@/components/layout/AuthScene';
import { injectLoginLogicData, LoginLogicComponent } from '@/resources/auth/logics/Login';
import { TranslatePipe } from '@/utils/translate.pipe';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, AuthScene, LoginLogicComponent, TranslatePipe],
  host: { class: 'flex flex-col flex-1 min-h-dvh' },
  template: `
    <app-auth-scene>
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ 'auth.login.title' | t }}
        </h1>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ 'auth.login.subtitle' | t }}
        </p>
      </div>

      <app-login-logic [logicData]="loginLogicData" />

      <p class="border-t border-gray-200 pt-5 text-center text-sm text-gray-600 dark:border-neutral-800 dark:text-gray-400">
        {{ 'auth.login.noAccount' | t }}

        <a
          routerLink="/auth/register"
          class="font-medium text-primary-600 underline-offset-4 hover:underline dark:text-primary-300"
        >
          {{ 'auth.login.requestAccess' | t }}
        </a>
      </p>
    </app-auth-scene>
  `,
})
export class LoginPage {
  private readonly router = inject(Router);

  protected readonly loginLogicData = injectLoginLogicData({
    onSuccess: () => this.router.navigateByUrl('/dashboard'),
  });
}
