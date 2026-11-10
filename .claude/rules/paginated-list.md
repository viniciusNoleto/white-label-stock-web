# Listas paginadas — createQuery + refetch manual

## Regras

- `page` é um `signal(1)`; filtros num único `signal<{Lista}Filters>({ … })`.
- O `queryFn` lê `page()` e `filters()` no momento da busca; a query **não** reage sozinha a eles — a lista só busca de novo via `refetch()`.
- Trocar de página: `page.set(n)` **e** `refetch()`.
- Filtros: `debouncedEffect(this.filters, () => { page.set(1); refetch(); }, 500)` — passe o signal inteiro de filtros, não campos.
- **Toda** listagem do sistema é paginada (na API e na página). `per_page` = `DEFAULT_PER_PAGE` (`8`, em `@/shared/constants/pagination`) — fixo por enquanto; nunca escreva o número na página.
- Opções de select (carregar tudo de uma vez): `per_page: MAX_PER_PAGE` (`100`, o teto da API).
- Endpoint paginado devolve `{ items, meta }`: leia `data.items` / `data.meta`.

## Estrutura

```ts
type ItemsFilters = { search: string };

export class ItemsPage {
  protected readonly page = signal(1);
  protected readonly filters = signal<ItemsFilters>({ search: '' });

  protected readonly itemsQuery = createQuery({
    queryFn: () => getItemsService({
      query: { search: this.filters().search || undefined, page: this.page(), per_page: DEFAULT_PER_PAGE },
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

## Filtros na URL

Listas cujo filtro vale compartilhar por link (Itens, Operação, Movimentações) espelham os filtros na query string com `injectFilterQueryParams` (`@/utils/query-params`):

```ts
private readonly filterParams = injectFilterQueryParams<ItemsFilters>({
  read: (params) => ({ code: params.get('code') ?? '', productId: idParam(params, 'product') }),
  write: (filters) => ({ code: filters.code.trim(), product: filters.productId }),
});

protected readonly filters = signal<ItemsFilters>(this.filterParams.initial);

constructor() {
  this.filterParams.bind(this.filters);          // link aberto com a página já ativa

  debouncedEffect(this.filters, (filters) => {
    this.filterParams.save(filters);             // grava na URL (replaceUrl), vazios somem
    this.page.set(1);
    this.itemsQuery.refetch();
  }, 500);
}
```

Nomes dos parâmetros: `code` (código do item), `search` (Operação: nome ou SKU do produto; Movimentações: código do item ou nome do produto), `product`, `storage`, `expires_at`, `expiration`, `type`, `from`/`to` (período das Movimentações). Links para a lista usam os mesmos (`routerLink="/inventory/items" [queryParams]="{ product: id, expires_at: date }"`).
