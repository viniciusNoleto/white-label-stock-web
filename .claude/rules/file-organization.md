# Organização de arquivos

```
src/
├── main.ts / main.server.ts / server.ts   ← bootstrap browser / SSR / servidor Express (API + SSR)
├── index.html / styles.css                ← tokens de tema (paleta da marca) e utilitários CSS
├── app/                                   ← rotas (espelha o app/ do Next)
│   ├── app.ts, app.config.ts, app.routes.ts, app.routes.server.ts
│   ├── page.ts                            ← /
│   ├── auth/login/page.ts                 ← /auth/login
│   ├── inventory/layout.ts                ← casca autenticada (AppShell + <router-outlet>)
│   ├── inventory/{items,categories,units,storages}/page.ts
│   └── not-found/page.ts
├── components/
│   ├── form/      ← FormTextInput, FormSelect, FormButton… (Spartan + Signal Forms)
│   ├── layout/    ← AppShell, AppHeader, AppSidebar, AttributionFooter, WavesBackground…
│   └── utils/     ← UtilsCard, UtilsTable, UtilsModal, UtilsPagination
├── resources/{recurso}/   ← módulo de domínio (singular, kebab-case)
│   ├── enums/  guards/  logics/  models/  schemas/  services/  stores/
├── server/                ← backend (Express + Drizzle) — nunca importado pelo browser
│   ├── api/               ← um router por recurso (`/api/{recurso}`)
│   ├── auth/              ← tokens, sessão (cookies), middlewares
│   ├── utils/api.ts       ← envelope `{ success, message, data }`
│   └── db.ts
├── libs/                  ← i18n, ícones, yup locales, `ui/` (componentes helm do Spartan)
├── locales/               ← pt-br, es-mx, en-us
├── shared/                ← constantes e tipos usados por front e back
└── utils/                 ← AppClient, createQuery/createMutation, validatedFormState, notify…
db/                        ← schema Drizzle, migrations, seed
tests/api/                 ← integração da API (Vitest + Postgres `_test`)
tests/e2e/                 ← Playwright
src/**/*.spec.ts           ← unitários do Angular (`ng test`)
```

## Regras

- Página = `src/app/{rota}/page.ts`, classe `{Nome}Page`, carregada com `loadComponent` em `app.routes.ts` com `title` = chave de tradução.
- Nome do módulo de resource no **singular**; subpastas no **plural**.
- Componentes helm (`src/libs/ui`) são gerados pelo Spartan CLI (`npx ng g @spartan-ng/cli:ui <nome>`) — não edite à mão sem necessidade; use os wrappers de `components/`.
- Código de `src/server/**` usa imports relativos (roda também via `tsx`/Vitest fora do Angular); o front usa o alias `@/` (= `src/`).
- Frontend nunca acessa o banco; tudo passa pela API.
