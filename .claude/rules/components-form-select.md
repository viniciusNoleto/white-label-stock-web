# FormSelect e FormMultiSelect

```ts
import { FormSelect } from '@/components/form/Select';           // app-form-select (hlm-select)
import { FormMultiSelect } from '@/components/form/MultiSelect'; // app-form-multi-select (hlm-combobox-multiple)
```

## Interface

```ts
data = input<readonly unknown[]>([]);
valueField = input<string>();   // modo objeto
labelField = input<string>();   // modo objeto
clearable = input(false);       // só FormSelect
// FormSelect.value:      string | number | null
// FormMultiSelect.value: (string | number)[]  (nunca null)
```

Os mesmos inputs comuns dos demais (`label`, `placeholder`, `description`, `withAsterisk`) e ligação por `[formField]` ou `[(value)]`.

## Dois modos de `data`

### Modo objeto — entidades da API

```html
<app-form-select
  valueField="id"
  labelField="name"
  [label]="'forms.inventoryItem.unit.label' | t"
  [data]="units()"
  [formField]="form.field.unit_id"
  withAsterisk
/>
```

O valor guardado é o **id como veio da API** (`number`) — no schema: `yup.number().nullable().default(null)`.

### Modo direto — `string[]` ou `{ value, label }[]`

```html
<app-form-select
  [data]="[{ value: 'set', label: 'forms.updateQuantity.mode.set' | t }]"
  [(value)]="mode"
/>
```

## Seleção múltipla

```html
<app-form-multi-select
  valueField="id"
  labelField="name"
  [label]="'forms.inventoryItem.categories.label' | t"
  [data]="categories()"
  [formField]="form.field.category_ids"
/>
```

Tem busca embutida (filtra pelo label) e mostra os selecionados como chips. Schema: `yup.array(yup.number().required()).default([])`.
