# Sessão e tokens (fluxo do rentable)

## API (white-label-stock-api — `app/Services/Auth/`, `AuthController`)

- Tokens **opacos** (32 bytes aleatórios), não JWT. No banco vai só o `sha256` (`access_tokens`, `refresh_tokens`).
- Access token: 15 min. Refresh token: 30 dias, com `family_id`.
- Ambos vivem **só** em cookies `httpOnly`, `SameSite=Lax`, `Secure` em produção (`COOKIE_SECURE` no `.env` da API sobrescreve). Nenhum código do browser lê ou escreve esses cookies; o login não devolve token no corpo.
- Refresh (`POST /api/auth/token/refresh`) **rotaciona**: revoga o token usado e emite um par novo na mesma família. Reapresentar um token já rotacionado revoga a **família inteira** (sinal de roubo).
- `RefreshSessionService` deduplica refreshes concorrentes do mesmo token por 10 s (lock + resultado no cache, compartilhado entre os workers do php-fpm) — sem isso, abas/chamadas paralelas/SSR cairiam na detecção de reuso.
- `GET /api/auth/me`: `{ user: null }` para anônimo (sem cookies); 401 quando só sobrou o refresh (o client renova).

## Servidor do web (`src/server/`)

- `api-proxy.ts`: repassa `/api/**` para `API_URL` com os cookies da requisição e devolve todos os `Set-Cookie` da API — os cookies continuam sendo da origem do web.
- `page-session.ts` (middleware de páginas, papel do `proxy.ts` do Next): sem access mas com refresh → chama o refresh **na API** e renova antes de servir a página (reescreve o header `cookie` do render); sem cookie nenhum em `/inventory/**` → 302 para `/auth/login`; logado em `/auth/login` (confirmado via `/api/auth/me`) → 302 para `/inventory`. API fora do ar → serve a página mesmo assim.

## Browser (`src/utils/app-client.ts`, `src/resources/auth/`)

- `authRefreshInterceptor`: 401 → um único refresh compartilhado por todas as chamadas da aba (`SessionRefresher`) → repete a chamada uma vez. Rotas de auth nunca disparam refresh.
- Refresh falhou → `AppEvents.sessionExpired$` → `AuthStore` zera o usuário, avisa e vai para o login.
- `AuthStore.user` é a fonte única do usuário logado; `authGuard` protege `/inventory` (`ensureUser()`).
- Páginas do inventário são `RenderMode.Client`; páginas públicas são SSR.

## Ao criar rotas novas

- API protegida: na API, dentro do grupo `Route::middleware('auth')` de `routes/api.php`.
- Página protegida: dentro de `inventory` em `app.routes.ts` (herda `authGuard`) e prefixo listado em `PROTECTED_PAGE_PREFIXES`.
