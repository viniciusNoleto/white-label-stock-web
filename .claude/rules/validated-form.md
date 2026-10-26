# Formulário validado — validatedFormState + createMutation

Equivalente Angular do `useValidatedFormState` + `useMutation` do React. Signal Forms (`@angular/forms/signals`) por baixo, schema **Yup** por cima.

```ts
import { validatedFormState } from '@/utils/form';
import { createMutation } from '@/utils/query';
import { injectNotify } from '@/utils/notify';
```

## Regras

- Schema Yup **reativo ao idioma**: `computed(() => yup.object({ … i18n.t('…') }))`, nome `{ação}Schema`. Schema compartilhado entre create/update → `schemas/{recurso}.ts` como função `inject{Recurso}Schema()`.
- Todo campo tem `.default(…)` (é o estado inicial e o `reset()`). Campos opcionais numéricos: `.nullable().default(null)`.
- Retornos prefixados pela ação: `createUnitValidatedFormState`, `createUnitMutation`, `createUnitReset` — nunca `form`, `mutation` genéricos.
- Validação na função de submit do componente, **antes** de `mutate()` — nunca dentro do `mutationFn`.
- `onSuccess`/`onError` sempre na `inject…LogicData`; mensagens via `injectNotify()`.

## API de `validatedFormState(schema)`

| Membro | Uso |
|---|---|
| `state` | `WritableSignal` com o objeto do form — é o que vai para o service (`state()`) |
| `field` | árvore do Signal Forms: `[formField]="form.field.name"` |
| `setValue(key, value)` / `setState(value)` | escrita imperativa |
| `reset(value?)` | volta ao default do schema (ou ao `value`) e limpa touched/erros |
| `validate()` | marca tudo como tocado (mostra erros) e retorna `boolean` **síncrono** |

O Standard Schema nativo do Yup é assíncrono; o projeto usa `toSyncStandardSchema` (`validateSync`) para os erros aparecerem na hora. Não use testes assíncronos (`.test(async …)`) nos schemas.

## `createMutation`

```ts
const createUnitMutation = createMutation({
  mutationFn: () => createUnitService({ body: createUnitValidatedFormState.state() }),
  onSuccess: (res) => {
    notify.success(res);          // sempre a mensagem i18n da API (res.message)

    onSuccess();
  },
  onError: (err) => notify.error(err, 'notifications.errors.createUnit'), // mensagem da API ou fallback
});

createUnitMutation.mutate();       // isPending() é signal
```

## Submit no componente

```ts
protected createUnit() {
  const { createUnitValidatedFormState, createUnitMutation } = this.logicData();

  if (!createUnitValidatedFormState.validate()) return;

  createUnitMutation.mutate();
}
```

Para limpar campo após erro: `setValue('password', '')` — nunca `undefined`.
