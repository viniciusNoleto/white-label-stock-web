# White Label Inventory System

White Label Inventory System is an open, white-label inventory management application built with [Angular](https://angular.dev). It is designed to be generic and reusable: items, categories and units of measurement are modeled so that anyone — companies, agencies, or individual developers — can fork, rebrand, and deploy their own inventory system on top of it without rebuilding the core from scratch.

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
browser ──(same origin, httpOnly cookies)──▶ web: Express + Angular SSR ──(API_URL)──▶ white-label-stock-api (Laravel) ──▶ PostgreSQL
                                             · /api/** → proxy (src/server/api-proxy.ts)
                                             · pages  → session refresh (src/server/page-session.ts) + SSR
```

The browser never talks to the API directly: the Express server forwards `/api/**` with the session cookies and passes every `Set-Cookie` back, so cookies stay first-party and no CORS is needed.

## Authentication

Sign-in uses **opaque access/refresh tokens** stored only as `httpOnly` cookies (only their SHA-256 hash is persisted). Access tokens last 15 minutes; refresh tokens last 30 days and are **rotated on every use**, with reuse detection that revokes the whole token family. The browser client renews the session transparently on `401` (a single shared refresh per tab), and page navigations are renewed server-side (by calling the API) before rendering. Tokens are issued and stored by the API. There is no public sign-up: create accounts with the API seed (`SEED_ADMIN_*` in the API `.env`, then `make db-seed` there).

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
cd ../white-label-inventory-system
cp .env.example .env   # API_URL and E2E_DB_* already point to the local API
make install
```

`make install` builds the image, installs dependencies inside the container, starts `white-label-inventory-system-front` (Angular dev server with SSR) and checks that the API answers. The app is served at `http://localhost:$APP_PORT` (default `3005`). The container reaches the API through `API_URL` (default `http://host.docker.internal:8005`, the port the API publishes on the host).

| Command | Effect |
|---|---|
| `make up` / `make down` / `make restart` | Start / stop / restart the containers |
| `make logs` | Follow the app container logs |
| `make shell` | Open a shell inside the app container |
| `make check-api` | Check that the API answers at `API_URL` |
| `make test` | Angular unit tests (`ng test`, Vitest + jsdom) |
| `make test-server` / `make test-server-coverage` | Express server tests (API proxy and page session, against a fake API) |
| `make test-e2e` | Playwright e2e suite from the host against the running app |

### Tests

- **Unit (`src/**/*.spec.ts`)** — form/query helpers, the HTTP client and its refresh flow, form and table components.
- **Server (`tests/server`)** — the `/api` proxy (method, body, cookies, every `Set-Cookie`, 502 when the API is down, 413) and the page session middleware (refresh before rendering, redirects), against a fake API.
- **E2E (`tests/e2e`)** — full user flows against the web **and** the real API. The setup creates the e2e user directly in the API database (`E2E_DB_*` in `.env`, the Postgres port the API publishes on the host); every record is named with the `e2e-` prefix and removed before and after the run. Install the browser once with `npx playwright install chromium`.
- **API** — route, auth and business rule tests live in `white-label-stock-api` (Pest, `make test` there).

### Deploy (homolog / production)

`docker-compose.homolog.yml` and `docker-compose.production.yml` run two containers: the app (`configs/docker/node/Dockerfile.deploy`, multi-stage `ng build` → `node dist/.../server/server.mjs`) and nginx with certbot (`configs/docker/nginx`) in front of it. Deploy the API first (see its README).

1. Set `APP_ENV=homolog` or `production` in `.env`.
2. Set `API_URL` to the API address reachable **from the web container** (e.g. `http://host.docker.internal:<API port>` when both run on the same host, or the API's internal/public URL).
3. Add the public domain to `NG_ALLOWED_HOSTS` and set `NG_TRUST_PROXY_HEADERS=x-forwarded-proto,x-forwarded-host,x-forwarded-for` (Angular SSR rejects unknown `Host` headers).
4. Replace `server_name _;` in `configs/docker/nginx/conf/route.conf` with your domain.
5. `make build && make up`, then `make certbot d=your.domain`.

Session cookies are set by the API and are `Secure` in production, so the web app must be reached over HTTPS (set `COOKIE_SECURE=false` in the **API** `.env` only to test over plain HTTP).

### White-labeling

- Brand name and author link: `src/shared/constants/brand.ts`.
- Colors: the `--color-primary-*` / `--color-secondary-*` / `--color-tertiary-*` scales in `src/styles.css`.
- Texts: `src/locales/*.ts`.

## License

This project is free to use, modify, and white-label, provided the attribution footer described above (link to the [author's LinkedIn](https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/)) is kept visible on every screen. See [LICENSE.md](./LICENSE.md) for the full terms.
