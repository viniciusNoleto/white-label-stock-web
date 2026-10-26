# White Label Inventory System

White Label Inventory System is an open, white-label inventory management application built with [Angular](https://angular.dev). It is designed to be generic and reusable: items, categories and units of measurement are modeled so that anyone — companies, agencies, or individual developers — can fork, rebrand, and deploy their own inventory system on top of it without rebuilding the core from scratch.

## Concept

The goal of this project is to provide a solid, ready-to-use inventory management foundation that is free to use and adapt. "White label" means you are welcome to customize the branding, theme, copy, and business rules to fit your own product or your client's product.

**The only condition for using this project (white-labeled or not) is keeping the attribution footer in place.** Every screen must keep a footer crediting the original author with a "Created by..." line linking to:

[Vinícius Nolêto de Araújo — LinkedIn](https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/)

Do not remove or hide this link when reusing, forking, or white-labeling this project.

## Tech Stack

- [Angular 22](https://angular.dev) — standalone components, signals, zoneless change detection, [Signal Forms](https://angular.dev/guide/forms/signals)
- [Angular SSR](https://angular.dev/guide/ssr) + [Express](https://expressjs.com) — one Node process serves the pages **and** the REST API (`/api/**`)
- [Spartan UI](https://spartan.ng) (UI components) + [Tailwind CSS 4](https://tailwindcss.com)
- [RxJS](https://rxjs.dev) Observables for HTTP, wrapped by small `createQuery` / `createMutation` signal helpers
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL
- [Yup](https://github.com/jquense/yup) (schema validation, plugged into Signal Forms)
- [i18next](https://www.i18next.com) (pt-BR, es-MX, en-US)
- Vitest (unit + API integration) and Playwright (e2e)

## Authentication

Sign-in uses **opaque access/refresh tokens** stored only as `httpOnly` cookies (only their SHA-256 hash is persisted). Access tokens last 15 minutes; refresh tokens last 30 days and are **rotated on every use**, with reuse detection that revokes the whole token family. The browser client renews the session transparently on `401` (a single shared refresh per tab), and page navigations are renewed server-side before rendering. There is no public sign-up: create accounts with the seed (`SEED_ADMIN_*` in `.env`, then `make db-seed`).

## Configuration & Deploy

### Requirements

- Docker + Docker Compose
- Node.js 22+ on the host (only for the Playwright e2e suite)

### Local setup

```bash
cp .env.example .env   # fill SEED_ADMIN_NAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
make install
```

`make install` builds the image, installs dependencies inside the container, starts `white-label-inventory-system-front` (Angular dev server with SSR + API) and `white-label-inventory-system-postgres`, runs the migrations and the seed. The app is served at `http://localhost:$APP_PORT` (default `3005`); Postgres listens on `$POSTGRES_PORT` (default `5443`).

| Command | Effect |
|---|---|
| `make up` / `make down` / `make restart` | Start / stop / restart the containers |
| `make logs` | Follow the app container logs |
| `make shell` | Open a shell inside the app container |
| `make db-migrate` / `make db-generate` / `make db-studio` / `make db-seed` | Drizzle migrations / new migration / Drizzle Studio / seed |
| `make test` | Angular unit tests (`ng test`, Vitest + jsdom) |
| `make test-api` / `make test-api-coverage` | API integration tests against `${POSTGRES_DB}_test` |
| `make test-e2e` | Playwright e2e suite from the host against the running app |

### Tests

- **Unit (`src/**/*.spec.ts`)** — form/query helpers, the HTTP client and its refresh flow, form and table components.
- **API (`tests/api`)** — every route through a real Express server and a real Postgres database `${POSTGRES_DB}_test` (created and migrated automatically, truncated before each test), including token rotation, reuse detection and concurrent builds.
- **E2E (`tests/e2e`)** — full user flows. Every record is named with the `e2e-` prefix and removed before and after the run. Install the browser once with `npx playwright install chromium`.

### Deploy (homolog / production)

`docker-compose.homolog.yml` and `docker-compose.production.yml` run three containers: the app (`configs/docker/node/Dockerfile.deploy`, multi-stage `ng build` → `node dist/.../server/server.mjs`), Postgres and nginx with certbot (`configs/docker/nginx`) in front of it.

1. Set `APP_ENV=homolog` or `production` in `.env`.
2. Add the public domain to `NG_ALLOWED_HOSTS` and set `NG_TRUST_PROXY_HEADERS=x-forwarded-proto,x-forwarded-host,x-forwarded-for` (Angular SSR rejects unknown `Host` headers).
3. Replace `server_name _;` in `configs/docker/nginx/conf/route.conf` with your domain.
4. `make build && make up && make db-migrate && make db-seed`, then `make certbot d=your.domain`.

Session cookies are `Secure` in production, so the app must be reached over HTTPS (set `COOKIE_SECURE=false` only to test over plain HTTP).

### White-labeling

- Brand name and author link: `src/shared/constants/brand.ts`.
- Colors: the `--color-primary-*` / `--color-secondary-*` / `--color-tertiary-*` scales in `src/styles.css`.
- Texts: `src/locales/*.ts`.

## License

This project is free to use, modify, and white-label, provided the attribution footer described above (link to the [author's LinkedIn](https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/)) is kept visible on every screen. See [LICENSE.md](./LICENSE.md) for the full terms.
