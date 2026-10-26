# Diretiva Form

`import { Form } from '@/components/form/Form';`

## Interface

```ts
// <form appForm (submitted)="…">
readonly submitted = output<void>(); // sem evento — preventDefault já aplicado
```

## Quando usar

Em **todo** formulário. Previne o submit nativo e emite `submitted` (Enter ou botão `type="submit"`). Também aplica `novalidate` — a validação é do schema Yup.

## Padrão correto

```html
<form
  appForm
  class="flex flex-col gap-6"
  (submitted)="createUnit()"
>
  <app-form-text-input
    [label]="'forms.unit.name.label' | t"
    [formField]="form.field.name"
    withAsterisk
  />

  <button
    appButton
    type="submit"
    [loading]="isPending"
  >
    {{ 'common.actions.save' | t }}
  </button>
</form>
```

## Notas

- O handler não recebe evento: `(submitted)="createUnit()"`.
- O botão de envio precisa de `type="submit"` (o `appButton` é `type="button"` por padrão).
