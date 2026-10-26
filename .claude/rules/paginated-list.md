# Listas paginadas — createQuery + refetch manual

## Regras

- `page` é um `signal(1)`; filtros num único `signal<{Lista}Filters>({ … })`.
- O `queryFn` lê `page()` e `filters()` no momento da busca; a query **não** reage sozinha a eles — a lista só busca de novo via `refetch()`.
- Trocar de página: `page.set(n)` **e** `refetch()`.
- Filtros: `debouncedEffect(this.filters, () => { page.set(1); refetch(); }, 500)` — passe o signal inteiro de filtros, não campos.
- `per_page` padrão: `15`.

## Estrutura

```ts
type ItemsFilters = { search: string };

export class ItemsPage {
  protected readonly page = signal(1);
  protected readonly filters = signal<ItemsFilters>({ search: '' });

  protected readonly itemsQuery = createQuery({
    queryFn: () => getInventoryItemsService({
      query: { search: this.filters().search || undefined, page: this.page(), per_page: 15 },
    }),
  });

  protected readonly items = computed(() => this.itemsQuery.data()?.data.items ?? []);
  protected readonly meta = computed<Partial<PaginatedMeta>>(() => this.itemsQuery.data()?.data.meta ?? {});

  constructor() {
    debouncedEffect(this.filters, () => {
      this.page.set(1);
      this.itemsQuery.refetch();
    }, 500);
  }

  protected setFilter<K extends keyof ItemsFilters>(key: K, value: ItemsFilters[K]) {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  protected changePage(page: number) {
    this.page.set(page);
    this.itemsQuery.refetch();
  }
}
```

## `createQuery`

- Busca uma vez ao ser criada (só no browser) e depois apenas via `refetch()`.
- `refetch()` cancela a busca anterior em andamento (desinscreve o Observable → aborta o HTTP).
- Expõe signals `data`, `error`, `isFetching`.
- Chame em contexto de injeção (inicializador de campo ou `inject…LogicData`).
