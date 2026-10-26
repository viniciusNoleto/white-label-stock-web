# Resources — Logics

Um Logic encapsula **uma ação sobre um resource**: função de dados (estado + mutação + helpers) + componente de UI. Fica em `src/resources/{module}/logics/{ActionName}.ts` — um arquivo por ação.

Cada arquivo exporta:
1. `inject{ActionName}LogicData(options)` — equivalente ao hook `use…LogicData` do React. Precisa de contexto de injeção: chame num inicializador de campo da página.
2. `{ActionName}LogicComponent` — componente (`selector: 'app-{action-name}-logic'`) com `logicData = input.required<ReturnType<typeof inject…LogicData>>()` e `cancel = output<void>()`.

## Padrão 1 — confirmação (delete/activate)

```ts
export function injectDeleteUnitLogicData({ editingUnitId, onSuccess }: { editingUnitId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const deleteUnitMutation = createMutation({
    mutationFn: () => deleteUnitService({ unitId: editingUnitId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.deleteUnit'),
  });

  return { deleteUnitMutation };
}
```

Botão de confirmação: `variant="destructive"` para excluir/desativar.

## Padrão 2 — formulário (create/update)

```ts
export function injectCreateUnitLogicData({ onSuccess }: { onSuccess: () => void }) {
  const notify = injectNotify();

  const createUnitValidatedFormState = validatedFormState(injectUnitSchema());

  const createUnitMutation = createMutation({ … });

  function createUnitReset() {
    createUnitValidatedFormState.reset();
  }

  return { createUnitValidatedFormState, createUnitMutation, createUnitReset };
}

@Component({
  selector: 'app-create-unit-logic',
  imports: [Form, FormField, FormTextInput, FormButton, TranslatePipe],
  template: `
    @let form = logicData().createUnitValidatedFormState;

    @let isPending = logicData().createUnitMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="createUnit()"
    >
      …
    </form>
  `,
})
export class CreateUnitLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectCreateUnitLogicData>>();
  readonly cancel = output<void>();

  protected createUnit() {
    const { createUnitValidatedFormState, createUnitMutation } = this.logicData();

    if (!createUnitValidatedFormState.validate()) return;

    createUnitMutation.mutate();
  }
}
```

### Create vs. update

- **Create:** recebe os params de contexto; `{action}Reset()` restaura o default do schema.
- **Update/ações sobre um item:** recebe `editing{Resource}Id: Signal<number | undefined>` (a página passa `computed(() => this.editingUnit()?.id)`); expõe `{action}Init(item)`, que a página chama antes de abrir o modal (`reset({ … })` com os dados do item).

## Consumo na página

```ts
protected readonly createUnitLogicData = injectCreateUnitLogicData({
  onSuccess: () => {
    this.unitsQuery.refetch();
    this.closeModal('createUnit');
  },
});
```

```html
<app-create-unit-logic
  [logicData]="createUnitLogicData"
  (cancel)="closeModal('createUnit')"
/>
```

## Regras

- Um arquivo por ação.
- O componente nunca re-tipa a logic: sempre `ReturnType<typeof inject…LogicData>`.
- A função de dados não conhece o componente; o componente não tem mutação própria (pode ter queries de apoio, ex.: opções de um select).
- `onSuccess`/`onError` sempre na função de dados; sucesso usa `res.message` (via `notify.success(res)`).
- Nomes internos com prefixo da ação (`createUnitMutation`, `updateItemNameInit`) — evitam colisão quando a página usa várias logics.
