# Organização de arquivos

```
src/
├── main.ts / main.server.ts / server.ts   ← bootstrap browser / SSR / servidor Express (SSR + proxy /api)
├── index.html / styles.css                ← tokens do Spartan e utilitários CSS
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
├── server/                ← Express do SSR (BFF) — nunca importado pelo browser; sem banco
│   ├── api-proxy.ts       ← `/api/**` → white-label-stock-api (`API_URL`), cookies e Set-Cookie intactos
│   ├── page-session.ts    ← renova a sessão (refresh na API) antes de servir páginas
│   └── utils/             ← `apiUrl()`, envelope de erro do proxy, parse de cookies
├── libs/                  ← i18n, ícones, yup locales, `ui/` (componentes helm do Spartan)
├── locales/               ← pt-br, es-mx, en-us
├── shared/                ← constantes e tipos usados por front e back (`constants/colors.ts` = paleta da marca)
└── utils/                 ← AppClient, createQuery/createMutation, validatedFormState, notify…
tests/server/              ← proxy e page-session contra uma API falsa (Vitest)
tests/e2e/                 ← Playwright
src/**/*.spec.ts           ← unitários do Angular (`ng test`)
```

## Regras

- Página = `src/app/{rota}/page.ts`, classe `{Nome}Page`, carregada com `loadComponent` em `app.routes.ts` com `title` = chave de tradução.
- Nome do módulo de resource no **singular**; subpastas no **plural**.
- Componentes helm (`src/libs/ui`) são gerados pelo Spartan CLI (`npx ng g @spartan-ng/cli:ui <nome>`) — não edite à mão sem necessidade; use os wrappers de `components/`.
- Código de `src/server/**` usa imports relativos (roda também via Vitest fora do Angular); o front usa o alias `@/` (= `src/`).
- O web nunca acessa o banco; tudo passa pela API (projeto separado `white-label-stock-api`, Laravel). Rotas, schema e regras de negócio ficam lá.
