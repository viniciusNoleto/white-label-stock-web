# Formato das respostas da API

A API é o projeto **white-label-stock-api** (Laravel, pasta irmã `../white-label-stock-api`). Rotas, migrations, validação e regras de negócio vivem lá — este repositório só consome. O servidor Express do web faz proxy de `/api/**` para `API_URL` (`src/server/api-proxy.ts`), então o browser continua chamando `/api/...` na própria origem.

## Envelope (sempre)

```json
{ "success": true, "message": { "pt-br": "…", "es-mx": "…", "en-us": "…" }, "data": { … } }
```

- `message` é **sempre** o objeto i18n (`ApiMessage`) — resolvido no front por `resolveApiMessage` (já feito por `injectNotify`).
- Erro: `success: false`, `data: null`. 400 = JSON malformado; 401 = sem sessão; 403 = sem permissão (rota de admin para usuário comum; login com cadastro ainda pendente); 404 = não encontrado (inclui id inválido); 409 = conflito (registro em uso); 422 = payload inválido ou regra de negócio (ex.: estoque insuficiente); 500 = inesperado; **502 = API fora do ar** (respondido pelo próprio proxy do web, mesmo envelope).
- Listagem paginada: `data = { items, meta: { page, per_page, total, last_page } }` (`PaginatedResponse<T>` em `src/shared/types/api.ts`).

## snake_case em todo o JSON

Propriedades, ids `number`, decimais como `string` (`"2.5000"`). Os models do front (`I{Recurso}`) espelham o JSON exatamente — ver `resources-models.md`.

## Endpoint novo

1. Crie na API (rota, FormRequest, DTO, Service, Repository, Resource, teste Pest).
2. No web, só o service em `src/resources/{recurso}/services/` (`resources-services.md`). O proxy repassa qualquer caminho de `/api/**` — não há nada a registrar no Express.

## Rotas protegidas

Tudo em `/api` exige sessão (`Authorization: Bearer`, middleware `auth` da API), exceto `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` e `/api/auth/token/refresh`. Rotas de administração (`/api/users`, `/api/registration-requests`) exigem também `is_admin`. O `authRefreshInterceptor` põe o header sozinho — services não montam headers.
