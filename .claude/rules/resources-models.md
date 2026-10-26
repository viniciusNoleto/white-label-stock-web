# Resources — Models

Ficam em `src/resources/{recurso}/models/{Recurso}.ts`.

## Interface — sempre necessária

Espelha **exatamente** o JSON da API (snake_case, ids `number`, decimais como `string`). Nome com prefixo `I`.

```ts
export interface IUnit {
  id: number;
  name: string;
  abbreviation: string;
  created_at: string | null;
  updated_at: string | null;
}
```

## Funções derivadas

Cálculos sobre o model ficam no próprio arquivo como funções puras (testáveis), não em classes:

```ts
export function maxBuildableQuantity(item: Pick<IInventoryItem, 'components'>): number { … }
```

Crie uma classe `{Recurso}` só se for realmente preciso normalizar dados (ex.: arrays que podem vir `null`); o construtor recebe a interface.

## Proibido

- Re-exportar enums como alias (`export type X = EEnum`). Importe o enum de `enums/`.
