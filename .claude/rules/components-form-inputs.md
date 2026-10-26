# Inputs de formulário

```ts
import { FormTextInput } from '@/components/form/TextInput';          // app-form-text-input
import { FormPassword } from '@/components/form/Password';            // app-form-password
import { FormTextarea } from '@/components/form/Textarea';            // app-form-textarea
import { FormNumberInput } from '@/components/form/Number';           // app-form-number-input
import { FormColorInput } from '@/components/form/ColorInput';        // app-form-color-input
import { FormSegmentedControl } from '@/components/form/SegmentedControl'; // app-form-segmented-control
import { FormField } from '@angular/forms/signals';                   // diretiva [formField]
```

## O que são

Componentes sobre o Spartan UI (`hlmInput`, `hlmTextarea`, `hlm-toggle-group`…) que implementam o contrato `FormValueControl` do **Signal Forms** (base `FormControlBase` em `components/form/types.ts`). Diferente do Mantine:

- Ligação com formulário: `[formField]="logicData().xValidatedFormState.field.campo"` — o Angular sincroniza sozinho `value`, `errors`, `touched` e `disabled`. **Substitui o spread `{...field('campo')}` do React.**
- Fora de formulário (filtros): `[(value)]="sinal"` ou `[value]` + `(valueChange)`.
- O erro aparece só depois do blur ou de `validate()`.

## Inputs comuns (todos)

| Input | Tipo | Observação |
|---|---|---|
| `label` | `string` | |
| `placeholder` | `string` | |
| `description` | `string` | texto de ajuda abaixo do campo |
| `withAsterisk` | `boolean` | **asterisco visual**; a obrigatoriedade vem do schema Yup (equivale ao `required` do Mantine) |
| `inputId` | `string` | gerado automaticamente; o `<label for>` aponta para ele |

> Nunca use `[min]`, `[max]`, `[disabled]`, `[required]` junto com `[formField]`: são reservados pelo Signal Forms (erro NG8022). No número use `[minValue]`/`[maxValue]`.

## Específicos

| Componente | `value` | Extras |
|---|---|---|
| `FormTextInput` | `string` | `type` (`text`/`email`/`search`…), `autocomplete`, `leftIcon` (ex.: `lucideSearch`) |
| `FormPassword` | `string` | botão mostrar/ocultar, `autocomplete` |
| `FormTextarea` | `string` | `rows` |
| `FormNumberInput` | `number \| null` | vazio = `null`; `minValue`, `maxValue`, `step`, `ariaLabel` |
| `FormColorInput` | `string` (`#RRGGBB`) | `swatches` |
| `FormSegmentedControl` | `string \| number` | `data: { value, label }[]`, nunca fica vazio |

## Padrões corretos

```html
<app-form-text-input
  type="email"
  [label]="'auth.login.email.label' | t"
  [formField]="form.field.email"
  withAsterisk
/>

<app-form-number-input
  [minValue]="0"
  [label]="'forms.inventoryItem.quantity.label' | t"
  [formField]="form.field.quantity"
/>

<!-- filtro fora de formulário -->
<app-form-text-input
  type="search"
  leftIcon="lucideSearch"
  [placeholder]="'inventory.search.placeholder' | t"
  [value]="filters().search"
  (valueChange)="setFilter('search', $event)"
/>
```

No schema Yup, campos numéricos opcionais são `yup.number().nullable()`.
