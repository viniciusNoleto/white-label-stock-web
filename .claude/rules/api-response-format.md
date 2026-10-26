# Formato das respostas da API

Rotas em `src/server/api/*.ts` (Express), montadas em `/api` por `createApiRouter()`.

## Envelope (sempre)

```json
{ "success": true, "message": { "pt-br": "…", "es-mx": "…", "en-us": "…" }, "data": { … } }
```

- Use `jsonOk(res, data, message?, status?)` e `jsonError(res, message, status)` de `src/server/utils/api.ts`.
- `message` é **sempre** o objeto i18n (`msg(pt, es, en)`) — nunca string. Sucesso sem mensagem específica usa `MESSAGES.success`.
- Erro: `data: null`. 401 = sem sessão; 404 = não encontrado (inclui id inválido via `parseId`); 409 = conflito (ex.: registro em uso, FK `23503` ao excluir); 422 = payload inválido; 500 = inesperado (logar com `console.error`).
- Toda rota em `try/catch`; JSON malformado é tratado pelo handler do router (400).
- Escritas em várias tabelas ou que dependem de leitura (ex.: construir item) rodam em `db.transaction`, com `.for('update')` quando houver disputa por estoque.

## snake_case em todo o JSON

As propriedades JS do schema Drizzle são idênticas às colunas (snake_case) — senão o JSON vaza camelCase:

```ts
export const itemCategories = pgTable('item_categories', {
  id: serial('id').primaryKey(),
  color_hex: varchar('color_hex', { length: 7 }).notNull(),
  created_at: timestamp('created_at'),
});
```

O teste `tests/api/schema.test.ts` garante isso. Os models do front (`I{Recurso}`) espelham o JSON (ids `number`).

## Rotas protegidas

Tudo em `/api` exige sessão (middleware `requireUser`), exceto `/api/auth/**`. O usuário fica em `res.locals.user`.
