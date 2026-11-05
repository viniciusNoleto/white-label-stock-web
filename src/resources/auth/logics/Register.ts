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
import { registerUserService } from '../services/registerUser';

export const PASSWORD_MIN_LENGTH = 8;

/** Cadastro público: envia um pedido de cadastro; a conta só existe depois que um admin aprova. */
export function injectRegisterLogicData({ onSuccess }: { onSuccess: (email: string) => void }) {
  const i18n = inject(I18n);
  const notify = injectNotify();

  const registerSchema = computed(() => yup.object({
    name: yup.string().default('').trim().required(i18n.t('auth.register.validation.nameRequired')).max(150),
    email: yup.string().default('').trim().required(i18n.t('auth.login.validation.emailRequired')).email(i18n.t('auth.login.validation.emailInvalid')),
    password: yup.string().default('')
      .required(i18n.t('auth.login.validation.passwordRequired'))
      .min(PASSWORD_MIN_LENGTH, i18n.t('auth.register.validation.passwordMin', { min: PASSWORD_MIN_LENGTH })),
    password_confirmation: yup.string().default('')
      .required(i18n.t('auth.register.validation.passwordConfirmationRequired'))
      .oneOf([yup.ref('password')], i18n.t('auth.register.validation.passwordMismatch')),
  }));

  const registerValidatedFormState = validatedFormState(registerSchema);

  const registerMutation = createMutation({
    mutationFn: () => {
      const { name, email, password } = registerValidatedFormState.state();

      return registerUserService({ body: { name, email, password } });
    },
    onSuccess: (res) => {
      notify.success(res);

      onSuccess(registerValidatedFormState.state().email);
    },
    onError: (err) => notify.error(err, 'auth.register.notifications.error'),
  });

  function registerReset() {
    registerValidatedFormState.reset();
  }

  return { registerValidatedFormState, registerMutation, registerReset };
}

@Component({
  selector: 'app-register-logic',
  imports: [Form, FormField, FormTextInput, FormPassword, FormButton, TranslatePipe],
  template: `
    @let form = logicData().registerValidatedFormState;

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="register()"
    >
      <app-form-text-input
        autocomplete="name"
        [label]="'auth.register.name.label' | t"
        [placeholder]="'auth.register.name.placeholder' | t"
        [formField]="form.field.name"
        withAsterisk
      />

      <app-form-text-input
        type="email"
        autocomplete="email"
        [label]="'auth.login.email.label' | t"
        [placeholder]="'auth.login.email.placeholder' | t"
        [formField]="form.field.email"
        withAsterisk
      />

      <app-form-password
        autocomplete="new-password"
        [label]="'auth.login.password.label' | t"
        [placeholder]="'auth.register.password.placeholder' | t: { min: passwordMinLength }"
        [formField]="form.field.password"
        withAsterisk
      />

      <app-form-password
        autocomplete="new-password"
        [label]="'auth.register.passwordConfirmation.label' | t"
        [placeholder]="'auth.register.passwordConfirmation.placeholder' | t"
        [formField]="form.field.password_confirmation"
        withAsterisk
      />

      <button
        appButton
        type="submit"
        class="w-full"
        [loading]="logicData().registerMutation.isPending()"
      >
        {{ 'auth.register.submit' | t }}
      </button>
    </form>
  `,
})
export class RegisterLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectRegisterLogicData>>();

  protected readonly passwordMinLength = PASSWORD_MIN_LENGTH;

  protected register() {
    const { registerValidatedFormState, registerMutation } = this.logicData();

    if (!registerValidatedFormState.validate()) return;

    registerMutation.mutate();
  }
}
