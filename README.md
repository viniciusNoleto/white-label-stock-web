# White Label Stock

White Label Stock is an open, white-label inventory management application built with [Angular](https://angular.dev). It is designed to be generic and reusable: items, categories and units of measurement are modeled so that anyone — companies, agencies, or individual developers — can fork, rebrand, and deploy their own inventory system on top of it without rebuilding the core from scratch.

## Concept

The goal of this project is to provide a solid, ready-to-use inventory management foundation that is free to use and adapt. "White label" means you are welcome to customize the branding, theme, copy, and business rules to fit your own product or your client's product.

**The only condition for using this project (white-labeled or not) is keeping the attribution footer in place.** Every screen must keep a footer crediting the original author with a "Created by..." line linking to:

[Vinícius Nolêto de Araújo — LinkedIn](https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/)

Do not remove or hide this link when reusing, forking, or white-labeling this project.

## Tech Stack

- [Angular 22](https://angular.dev) — standalone components, signals, zoneless change detection, [Signal Forms](https://angular.dev/guide/forms/signals)
- [Angular SSR](https://angular.dev/guide/ssr) + [Express](https://expressjs.com) — renders the pages and proxies `/api/**` to the REST API
- REST API: separate project **[white-label-stock-api](../white-label-stock-api)** (Laravel 13 + PostgreSQL)
- [Spartan UI](https://spartan.ng) (UI components) + [Tailwind CSS 4](https://tailwindcss.com)
- [RxJS](https://rxjs.dev) Observables for HTTP, wrapped by small `createQuery` / `createMutation` signal helpers
- [Yup](https://github.com/jquense/yup) (schema validation, plugged into Signal Forms)
- [i18next](https://www.i18next.com) (pt-BR, es-MX, en-US)
- Vitest (unit + server) and Playwright (e2e)

## Architecture

This repository is **only the web app**. Everything that touches the database (routes, validation, business rules, sessions) lives in the API project `white-label-stock-api`.

```
browser ──(same origin, Authorization: Bearer)──▶ web: Express + Angular SSR ──(API_URL)──▶ white-label-stock-api (Laravel) ──▶ PostgreSQL
                                             · /api/** → proxy (src/server/api-proxy.ts)
                                             · pages  → session refresh (src/server/page-session.ts) + SSR
```

The browser never talks to the API directly: the Express server forwards `/api/**` (with the `Authorization` header) to the API, so no CORS is needed.

## Authentication

Sign-in uses **opaque access/refresh tokens** (only their SHA-256 hash is persisted by the API). The API returns them in the body of the login/refresh responses and reads the access token from `Authorization: Bearer`. The web keeps both in regular first-party cookies (`access_token` / `refresh_token`, `SameSite=Lax`, expiring with each token) so the browser client can build the header and the Express server can renew the session before rendering a page. Access tokens last 15 minutes; refresh tokens last 30 days and are **rotated on every use**, with reuse detection that revokes the whole token family. The browser client renews the session transparently on `401` (a single shared refresh per tab), and page navigations are renewed server-side (by calling the API) before rendering. The first account is the **administrator**, created by the API seed (`SEED_ADMIN_*` in the API `.env`, then `make db-seed` there).

### Sign-up with approval

Anyone can **request access** at `/auth/register` (linked from the login). That creates a *registration request*, not an account: signing in before the approval answers "awaiting approval". Administrators get an **Administration** group in the sidebar:

### Products, items and operation

- **Products** (`/inventory/products`) — the model of an item: unit, categories, recipe (other products used per unit), shelf life in days (optional) and tracking: **atomic** (each unit is an item with its own code — a cabinet, a cake) or **bulk** (an item is a lot with a quantity — screws, flour).
- **Items** (`/inventory/items`) — every stock record, with its code (`{SKU}-0001`… or typed), production date (default today) and expiration (production + shelf life). Atomic items can be generated in batches (8 cakes at once, each with its own code), optionally consuming the recipe from stock first-expiring first; expired stock is never consumed nor packaged.
- **Operation** (`/inventory/stock`) — the stock at a glance: atomic items grouped per product (4 cabinets → one row with 4), bulk lots one per row.
- **Deliveries** reserve specific items (first-expiring first) and show which codes to pick.

- **Registration requests** (`/inventory/registration-requests`) — approving creates a regular user with the password chosen at sign-up; rejecting deletes the request.
- **Users** (`/inventory/users`) — everyone with access; regular users can be deleted, which revokes their sessions at once. Administrators cannot be deleted.

Both screens (and their API routes) are admin-only: regular users don't see the menu, are sent back to the inventory, and get `403` from the API.

## Configuration & Deploy

### Requirements

- Docker + Docker Compose
- Node.js 22+ on the host (only for the Playwright e2e suite)
- The API (`white-label-stock-api`) running — see its README

### Local setup

```bash
# 1. API (other repository)
cd ../white-label-stock-api && cp .env.example .env && make install   # http://localhost:8005

# 2. Web
cd ../white-label-stock-web
cp .env.example .env   # API_URL and E2E_DB_* already point to the local API
make install
```

`make install` builds the image, installs dependencies inside the container, starts `white-label-stock-web` (Angular dev server with SSR) and checks that the API answers. The app is served at `http://localhost:$APP_PORT` (default `3005`). The container reaches the API through `API_URL` (default `http://host.docker.internal:8005`, the port the API publishes on the host).

| Command | Effect |
|---|---|
| `make up` / `make down` / `make restart` | Start / stop / restart the containers |
| `make logs` | Follow the app container logs |
| `make shell` | Open a shell inside the app container |
| `make check-api` | Check that the API answers at `API_URL` |
| `make test` | Angular unit tests (`ng test`, Vitest + jsdom) |
| `make test-server` / `make test-server-coverage` | Express server tests (API proxy and page session, against a fake API) |
| `make test-e2e` | Playwright e2e suite from the host against the running app |
| `npm run demo:video` | Records the presentation video (see below) |

### Tests

- **Unit (`src/**/*.spec.ts`)** — form/query helpers, the HTTP client and its refresh flow, form and table components.
- **Server (`tests/server`)** — the `/api` proxy (method, body, `Authorization`, no cookies in either direction, 502 when the API is down, 413) and the page session middleware (refresh before rendering, redirects), against a fake API.
- **E2E (`tests/e2e`)** — full user flows against the web **and** the real API. The setup creates the e2e user directly in the API database (`E2E_DB_*` in `.env`, the Postgres port the API publishes on the host); every record is named with the `e2e-` prefix and removed before and after the run. Install the browser once with `npx playwright install chromium`.
- **Presentation video (`tests/demo`)** — `npm run demo:video` records one long Playwright run through every feature (sign-up and approval, users, units, categories, storages, items and builds, deliveries, language, theme, small screens) and saves `videos/apresentacao.mp4` (ffmpeg trims it; without ffmpeg the raw `.webm` is kept). It never touches your data: it starts its own API container (`tests/demo/support/demo-api.sh`, port `DEMO_API_PORT`, default `8099`) on a separate `<DB_DATABASE>_demo` database in the API's Postgres, rebuilt from scratch at the start, and serves the production build on `DEMO_PORT` (default `3200`). Needs the API stack up (`make up` there); `DEMO_SKIP_BUILD=1` reuses the last `dist/`.
- **API** — route, auth and business rule tests live in `white-label-stock-api` (Pest, `make test` there).

### Deploy (homolog / production)

`docker-compose.homolog.yml` and `docker-compose.production.yml` run only the app container (`configs/docker/node/Dockerfile.deploy`, multi-stage `ng build` → `node dist/.../server/server.mjs`), behind the server's **Nginx Proxy Manager**, which handles the domain and the Let's Encrypt certificate. The container publishes no port: it joins NPM's Docker network. Deploy the API first (see its README).

1. Set `APP_ENV=homolog` or `production` in `.env`.
2. Set `API_URL=http://white-label-stock-api-nginx` — the API's nginx is on the same NPM network and publishes no port (see the API README).
3. Add the public domain to `NG_ALLOWED_HOSTS` and set `NG_TRUST_PROXY_HEADERS=x-forwarded-proto,x-forwarded-host,x-forwarded-for` (Angular SSR rejects unknown `Host` headers).
4. Set `PROXY_NETWORK` to NPM's network name (`docker network ls`; default `nginx-proxy-manager`).
5. `make build && make up`.
6. In NPM, add a Proxy Host: your domain → scheme `http`, forward hostname `white-label-stock-web`, port `3000`; in the SSL tab request a Let's Encrypt certificate and enable *Force SSL*.

The session cookies (`access_token` / `refresh_token`) are set by the web app and get `Secure` when the request arrived over HTTPS (read from the proxy's `X-Forwarded-Proto`), so serve the app over HTTPS.

### White-labeling

- Brand name: `APP_NAME` in `.env` (default `StockFlow`, in `src/shared/constants/brand.ts`). Read at runtime by the web server — UI, page titles and `site.webmanifest` follow it after a restart, no rebuild.
- Logo and icons: `public/` (`icon.png`, `icon-128.png`, favicons).
- Author link (attribution footer, must stay): `src/shared/constants/brand.ts`.
- Colors: the `--color-primary-*` / `--color-secondary-*` / `--color-tertiary-*` scales in `src/styles.css`.
- Texts: `src/locales/*.ts`.

## License

This project is free to use, modify, and white-label, provided the attribution footer described above (link to the [author's LinkedIn](https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/)) is kept visible on every screen. See [LICENSE.md](./LICENSE.md) for the full terms.
