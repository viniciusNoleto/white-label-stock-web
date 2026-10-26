# White Label Inventory System — instruções para agentes

Angular **22** (standalone, zoneless, signals, Signal Forms, OnPush padrão) com SSR via `@angular/ssr` + Express. **Só o web**: a API é o projeto separado `white-label-stock-api` (Laravel + PostgreSQL, pasta irmã); o Express faz proxy de `/api/**` para `API_URL` e não acessa banco. UI com **Spartan UI** (helm em `src/libs/ui`, brain em `@spartan-ng/brain`) + Tailwind 4. As boas práticas oficiais do Angular estão em `node_modules/@angular/core/resources/best-practices.md` — siga-as.

# Regras do projeto (`.claude/rules/`)

Cada arquivo documenta a interface exata, o comportamento e os padrões de um componente ou convenção. **Não infira a API pelo nome** — os wrappers divergem do Spartan/Mantine puros (ex.: inputs ligam por `[formField]`, `appButton` é `type="button"` por padrão). Leia a regra antes de escrever ou revisar código que toque nesses pontos.

## Templates

- Qualquer `template:` de componente → `angular-templates.md` (atributos em linha própria, texto em linha própria, linha em branco entre irmãos, `@if`/`@for` no lugar de `UtilsIf`/`UtilsFor`).
- Texto visível / idioma → `i18n.md`.

## Componentes de formulário

| Ao usar... | Leia |
|---|---|
| `<form appForm>` / submit | `components-form.md` |
| `FormTextInput`, `FormPassword`, `FormTextarea`, `FormNumberInput`, `FormColorInput`, `FormSegmentedControl` | `components-form-inputs.md` |
| `FormSelect`, `FormMultiSelect` | `components-form-select.md` |
| `appButton` (ícones, loading, tooltip) | `components-form-button.md` |
| Grid de campos | `form-grid.md` |
| Formulário com validação Yup + mutação | `validated-form.md` |

## Componentes utilitários

| Ao usar... | Leia |
|---|---|
| Painel branco com borda/sombra (`appCard`) | `components-utils-card.md` |
| Tabela de dados (com ou sem paginação) | `components-utils-table.md` |
| Modal | `components-utils-modal.md` |

## Páginas e listas

- Lista paginada com filtros e refetch manual → `paginated-list.md`.
- Estrutura de pastas, páginas e rotas → `file-organization.md`.

## Resources (`src/resources/{recurso}/`)

| Ao criar/editar... | Leia |
|---|---|
| `models/{Recurso}.ts` | `resources-models.md` |
| `enums/{Nome}.ts` | `resources-enums.md` |
| `services/{verbo}{Recurso}.ts` | `resources-services.md` |
| `logics/{Acao}.ts` | `resources-logic.md` |

## API e sessão

| Ao criar/editar... | Leia |
|---|---|
| Contrato da API, endpoint novo, proxy (`src/server/api-proxy.ts`) | `api-response-format.md` |
| Login, cookies, refresh, guards, rotas protegidas | `auth-session.md` |

## Verificação

- `npm run build` sem erros/avisos.
- `npm test` (unitários Angular), `npm run test:server` (proxy e page-session contra API falsa), `npm run test:e2e` (Playwright contra web + API rodando).
- Mudou algo na API? Os testes dela (`make test`, Pest) ficam no `white-label-stock-api`.
