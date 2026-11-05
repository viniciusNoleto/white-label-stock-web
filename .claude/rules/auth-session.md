# Sessão e tokens (Bearer, fluxo do white-label-utility-list)

## API (white-label-stock-api — `app/Actions/Auth/`, `AuthController`)

- Tokens **opacos** (32 bytes aleatórios), não JWT. No banco vai só o `sha256` (`access_tokens`, `refresh_tokens`).
- Access token: 15 min. Refresh token: 30 dias, com `family_id`.
- `POST /api/auth/login` e `POST /api/auth/token/refresh` devolvem a sessão **no corpo**: `{ user, access_token, refresh_token, expires_in, refresh_expires_in }` (`IAuthSession`; `expires_in`/`refresh_expires_in` em segundos). A API não lê nem grava cookies.
- Rotas protegidas leem o access token de `Authorization: Bearer <token>`.
- Refresh recebe `{ refresh_token }` no corpo e **rotaciona**: revoga o token usado e emite um par novo na mesma família. Reapresentar um token já rotacionado revoga a **família inteira** (sinal de roubo). Token inválido → 401.
- `RefreshSessionAction` deduplica refreshes concorrentes do mesmo token por 10 s (lock + resultado no cache) — sem isso, abas/chamadas paralelas/SSR cairiam na detecção de reuso.
- `GET /api/auth/me`: rota protegida, `{ user }` (`id`, `name`, `email`, `is_admin`); 401 sem access válido (o client renova).
- `POST /api/auth/register` (público): cria um **pedido de cadastro**, não a conta. Login com o pedido pendente → 403 (`messages.auth.pending_approval`). Admin aprova (vira usuário comum, mesma senha) ou recusa (o pedido é excluído) em `/api/registration-requests`; `/api/users` lista e exclui usuários comuns. Rotas de admin → 403 para usuário comum (403 **não** dispara refresh).
- `POST /api/auth/logout`: Bearer (se ainda houver) + `{ refresh_token }` no corpo; revoga os dois.

## Onde os tokens ficam no web

- Cookies **comuns** (não httpOnly) da origem do web: `access_token` (`Max-Age` = `expires_in`) e `refresh_token` (`Max-Age` = `refresh_expires_in`), `Path=/`, `SameSite=Lax`, `Secure` em HTTPS. Formato único em `serializeAuthCookie` (`src/shared/utils/auth-cookie.ts`), usado pelo browser e pelo servidor.
- Browser: `AuthTokens` (`src/resources/auth/stores/AuthTokens.ts`) lê/grava/apaga via `document.cookie` — sempre lido na hora, então a renovação feita pelo servidor ou por outra aba já vale. No SSR devolve `null`.
- Nunca grave token em `localStorage` nem no estado do `AuthStore`.

## Servidor do web (`src/server/`)

- `api-proxy.ts`: repassa `/api/**` para `API_URL` com `Authorization`, `Accept-Language` e o corpo. **Não** repassa os cookies do web para a API nem `Set-Cookie` da API para o browser.
- `page-session.ts` (middleware de páginas, papel do `proxy.ts` do Next): sem cookie de access mas com refresh → `POST /api/auth/token/refresh` com o refresh no corpo, grava o par novo via `Set-Cookie` antes de servir a página (e reescreve o header `cookie` do render); refresh recusado (401) → apaga os cookies e, em página protegida, 302 para `/auth/login`; sem cookie nenhum em `/inventory/**` → 302 para `/auth/login`; logado em `/auth/login` ou `/auth/register` (`GUEST_ONLY_PAGES`, confirmado via `/api/auth/me` com Bearer) → 302 para `/inventory`. API fora do ar → serve a página mesmo assim.

## Browser (`src/utils/app-client.ts`, `src/resources/auth/`)

- `authRefreshInterceptor`: põe `Authorization: Bearer` em toda chamada `/api/**` (exceto login e refresh). 401 → um único refresh compartilhado por todas as chamadas da aba (`SessionRefresher`, grava o par novo em `AuthTokens`) → repete a chamada uma vez, já com o token novo. Rotas de auth nunca disparam refresh; sem refresh_token nem chama a API.
- Refresh falhou → `AppEvents.sessionExpired$` → `AuthStore` encerra a sessão local (apaga tokens e usuário), avisa e vai para o login.
- `AuthStore.user` é a fonte única do usuário logado (`is_admin` incluído); `setSession(session)` no login, `clear()` no logout. `authGuard` protege `/inventory` (`ensureUser()` — sem nenhum token nem chama a API). `adminGuard` (rotas de administração: `users`, `registration-requests`) devolve o usuário comum para `/inventory`; o grupo "Administração" do `AppSidebar` só aparece para admin.
- Páginas do inventário são `RenderMode.Client`; páginas públicas são SSR.

## Ao criar rotas novas

- API protegida: na API, dentro do grupo `Route::middleware('auth')` de `routes/api.php`.
- Página protegida: dentro de `inventory` em `app.routes.ts` (herda `authGuard`) e prefixo listado em `PROTECTED_PAGE_PREFIXES`.
- Só admin: na API, dentro do grupo `Route::middleware('admin')`; no web, `canActivate: [adminGuard]` na rota e o link no `ADMIN_NAV_GROUP` do `AppSidebar`.
