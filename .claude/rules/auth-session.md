# Sessão e tokens (fluxo do rentable)

## Servidor (`src/server/auth/`)

- Tokens **opacos** (32 bytes aleatórios), não JWT. No banco vai só o `sha256` (`access_tokens`, `refresh_tokens`).
- Access token: 15 min. Refresh token: 30 dias, com `family_id`.
- Ambos vivem **só** em cookies `httpOnly`, `SameSite=Lax`, `Secure` em produção (`COOKIE_SECURE` sobrescreve). Nenhum código do browser lê ou escreve esses cookies; o login não devolve token no corpo.
- Refresh (`POST /api/auth/token/refresh`) **rotaciona**: revoga o token usado e emite um par novo na mesma família. Reapresentar um token já rotacionado revoga a **família inteira** (sinal de roubo).
- `refreshSession` deduplica refreshes concorrentes do mesmo token por 10 s (mesmo par novo para todos) — sem isso, abas/chamadas paralelas cairiam na detecção de reuso.
- `pageSession` (middleware de páginas, papel do `proxy.ts` do Next): sem access mas com refresh → renova antes de servir a página; sem cookie nenhum em `/inventory/**` → 302 para `/auth/login`; logado em `/auth/login` → 302 para `/inventory`.
- `GET /api/auth/me`: `{ user: null }` para anônimo (sem cookies); 401 quando só sobrou o refresh (o client renova).

## Browser (`src/utils/app-client.ts`, `src/resources/auth/`)

- `authRefreshInterceptor`: 401 → um único refresh compartilhado por todas as chamadas da aba (`SessionRefresher`) → repete a chamada uma vez. Rotas de auth nunca disparam refresh.
- Refresh falhou → `AppEvents.sessionExpired$` → `AuthStore` zera o usuário, avisa e vai para o login.
- `AuthStore.user` é a fonte única do usuário logado; `authGuard` protege `/inventory` (`ensureUser()`).
- Páginas do inventário são `RenderMode.Client`; páginas públicas são SSR.

## Ao criar rotas novas

- API protegida: monte o router depois de `router.use(requireUser)` em `src/server/api/index.ts`.
- Página protegida: dentro de `inventory` em `app.routes.ts` (herda `authGuard`) e prefixo listado em `PROTECTED_PAGE_PREFIXES`.
