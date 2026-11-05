import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FormButton } from '@/components/form/Button';
import { AuthScene } from '@/components/layout/AuthScene';
import { injectRegisterLogicData, RegisterLogicComponent } from '@/resources/auth/logics/Register';
import { TranslatePipe } from '@/utils/translate.pipe';

/**
 * Cadastro público: a pessoa pede acesso e fica aguardando um admin aprovar
 * (`/inventory/registration-requests`). Depois de enviado, o formulário dá lugar
 * à confirmação.
 */
@Component({
  selector: 'app-register-page',
  imports: [RouterLink, NgIcon, FormButton, AuthScene, RegisterLogicComponent, TranslatePipe],
  host: { class: 'flex flex-col flex-1 min-h-dvh' },
  template: `
    <app-auth-scene>
      @if (sentTo(); as email) {
        <div
          role="status"
          class="flex flex-col gap-4"
        >
          <span
            aria-hidden="true"
            class="center-flex size-12 border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
          >
            <ng-icon
              name="lucideMailCheck"
              size="22"
            />
          </span>

          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ 'auth.register.sent.title' | t }}
          </h1>

          <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {{ 'auth.register.sent.description' | t: { email } }}
          </p>
        </div>

        <a
          appButton
          routerLink="/auth/login"
          class="w-full"
          leftIcon="lucideChevronLeft"
        >
          {{ 'auth.register.backToLogin' | t }}
        </a>
      } @else {
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ 'auth.register.title' | t }}
          </h1>

          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ 'auth.register.subtitle' | t }}
          </p>
        </div>

        <app-register-logic [logicData]="registerLogicData" />

        <p class="border-t border-gray-200 pt-5 text-center text-sm text-gray-600 dark:border-neutral-800 dark:text-gray-400">
          {{ 'auth.register.hasAccount' | t }}

          <a
            routerLink="/auth/login"
            class="font-medium text-primary-600 underline-offset-4 hover:underline dark:text-primary-300"
          >
            {{ 'auth.login.submit' | t }}
          </a>
        </p>
      }
    </app-auth-scene>
  `,
})
export class RegisterPage {
  /** E-mail do pedido enviado — `null` enquanto o formulário está na tela. */
  protected readonly sentTo = signal<string | null>(null);

  protected readonly registerLogicData = injectRegisterLogicData({
    onSuccess: (email) => this.sentTo.set(email),
  });
}
