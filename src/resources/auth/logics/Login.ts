import { Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import * as yup from 'yup';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormPassword } from '@/components/form/Password';
import { FormTextInput } from '@/components/form/TextInput';
import { I18n } from '@/libs/i18n';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IAuthUser } from '../models/AuthUser';
import { loginUserService } from '../services/loginUser';
import { AuthStore } from '../stores/AuthStore';

export function injectLoginLogicData({ onSuccess }: { onSuccess: (user: IAuthUser) => void }) {
  const i18n = inject(I18n);
  const notify = injectNotify();
  const authStore = inject(AuthStore);

  const loginSchema = computed(() => yup.object({
    email: yup.string().default('').required(i18n.t('auth.login.validation.emailRequired')).email(i18n.t('auth.login.validation.emailInvalid')),
    password: yup.string().default('').required(i18n.t('auth.login.validation.passwordRequired')),
  }));

  const loginValidatedFormState = validatedFormState(loginSchema);

  const loginMutation = createMutation({
    mutationFn: () => loginUserService({ body: loginValidatedFormState.state() }),
    onSuccess: (res) => {
      authStore.setUser(res.data.user);

      onSuccess(res.data.user);
    },
    onError: (err) => {
      loginValidatedFormState.setValue('password', '');

      notify.error(err, 'auth.login.notifications.error');
    },
  });

  return { loginValidatedFormState, loginMutation };
}

@Component({
  selector: 'app-login-logic',
  imports: [Form, FormField, FormTextInput, FormPassword, FormButton, TranslatePipe],
  template: `
    @let form = logicData().loginValidatedFormState;

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="login()"
    >
      <app-form-text-input
        type="email"
        autocomplete="email"
        [label]="'auth.login.email.label' | t"
        [placeholder]="'auth.login.email.placeholder' | t"
        [formField]="form.field.email"
        withAsterisk
      />

      <app-form-password
        [label]="'auth.login.password.label' | t"
        [placeholder]="'auth.login.password.placeholder' | t"
        [formField]="form.field.password"
        withAsterisk
      />

      <button
        appButton
        type="submit"
        class="w-full"
        [loading]="logicData().loginMutation.isPending()"
      >
        {{ 'auth.login.submit' | t }}
      </button>
    </form>
  `,
})
export class LoginLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectLoginLogicData>>();

  protected login() {
    const { loginValidatedFormState, loginMutation } = this.logicData();

    if (!loginValidatedFormState.validate()) return;

    loginMutation.mutate();
  }
}
