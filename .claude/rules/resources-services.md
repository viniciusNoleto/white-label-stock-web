# Resources — Services

Um arquivo por endpoint em `src/resources/{recurso}/services/{verbo}{Recurso}.ts`. Cada um exporta uma função `{verbo}{Recurso}Service` que retorna o **Observable** do `AppClient`.

```ts
import { inject } from '@angular/core';
import { AppClient } from '@/utils/app-client';
import type { PayloadBody } from '@/shared/types/api';
import type { IUnit } from '../models/Unit';

export type UpdateUnitServicePayload = {
  name: string;
  abbreviation: string;
};

export function updateUnitService({ unitId, body }: PayloadBody<UpdateUnitServicePayload> & { unitId: number }) {
  return inject(AppClient).put<IUnit>(`/api/units/${unitId}`, { body });
}
```

## Regras

- O service usa `inject(AppClient)` — chame-o **dentro** de `createQuery`/`createMutation` (que rodam no contexto de injeção capturado) ou de um guard/`runInInjectionContext`. Nunca dentro de `setTimeout`/`subscribe` soltos.
- Sem lógica de negócio — só a chamada HTTP.
- Genérico do `AppClient` é sempre a interface do recurso (`IUnit`, `PaginatedResponse<IInventoryItem>`…), nunca `any`.
- Ids são `number` (como vêm da API). Parâmetro de rota nomeado `{recurso}Id`.
- Query params: `PayloadQuery<T>` + `inject(AppClient).get(url, { query })` (o client ignora valores vazios).
- Não há query keys: cache/compartilhamento não existe; quem precisa dos dados cria a própria `createQuery` e chama `refetch()`.
- Erros chegam nos `onError` como o envelope da API (`{ success: false, message, data }`); falha de rede vem com `message: null`.

## Nomenclatura

| Elemento | Padrão | Exemplo |
|---|---|---|
| Função | `{verbo}{Recurso}Service` | `getUnitsService`, `createUnitService` |
| Tipo de query | `Get{Recurso}ServiceQuery` | `GetInventoryItemsServiceQuery` |
| Tipo de payload | `{Verbo}{Recurso}ServicePayload` | `CreateUnitServicePayload` |
