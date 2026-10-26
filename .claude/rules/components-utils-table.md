# UtilsTable

```ts
import { UtilsTable, UtilsTableCell, type TableAction } from '@/components/utils/Table';
```

## Interface

```ts
rows = input.required<readonly T[]>();
columns = input.required<Record<string, string>>();  // campo → título; define a ordem
loading = input(false);                               // overlay com blur + spinner
emptyText = input<string>();                          // padrão: common.table.emptyDefault
rowKey = input<(ctx: { item: T; index: number }) => PropertyKey>();
actions = input<TableAction<T>[] | ((ctx) => TableAction<T>[])>();
page = input(1);
lastPage = input(1);                                  // paginação só aparece se > 1
pageChange = output<number>();

type TableAction<T> = {
  label: string;      // tooltip + aria-label (e texto, se não houver icon)
  icon?: string;      // ex.: 'lucidePencil'
  variant?: ButtonVariants['variant'];  // padrão 'outline'; 'destructive' para excluir
  onClick: (ctx: { item: T; index: number }) => void;
};
```

## Células customizadas — substitui `renderCells`

`<ng-template appTableCell="campo" [appTableCellOf]="rows()" let-item>` dentro da tabela. O `appTableCellOf` recebe as mesmas `rows` só para tipar o `let-item`. Campos sem template mostram o valor bruto.

## Padrão correto

```html
<app-utils-table
  [rows]="items()"
  [rowKey]="rowKey"
  [loading]="itemsQuery.isFetching()"
  [emptyText]="'inventory.table.empty' | t"
  [columns]="{
    name: 'inventory.table.columns.name' | t,
    quantity: 'inventory.table.columns.quantity' | t,
  }"
  [actions]="actions()"
  [page]="page()"
  [lastPage]="meta().last_page ?? 1"
  (pageChange)="changePage($event)"
>
  <ng-template
    appTableCell="quantity"
    [appTableCellOf]="items()"
    let-item
  >
    <span class="tabular-nums">
      {{ +item.quantity }}
    </span>
  </ng-template>
</app-utils-table>
```

```ts
protected readonly rowKey = ({ item }: { item: IUnit }) => item.id;

// labels traduzidos → computed (acompanha o idioma)
protected readonly actions = computed<TableAction<IUnit>[]>(() => [
  { icon: 'lucidePencil', label: this.i18n.t('common.actions.edit'), onClick: ({ item }) => this.openUpdateUnitModal(item) },
  { icon: 'lucideTrash2', label: this.i18n.t('common.actions.delete'), variant: 'destructive', onClick: ({ item }) => this.openDeleteUnitModal(item) },
]);
```

- Ações condicionais por linha: passe uma função `({ item }) => TableAction[]`.
- Ao trocar de página, `page.set(n)` + `refetch()` — ver `paginated-list.md`.
