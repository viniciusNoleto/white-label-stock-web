# White Label Inventory System

White Label Inventory System is an open, white-label inventory management application built with [Next.js](https://nextjs.org). It is designed to be generic and reusable: items, categories and units of measurement are modeled so that anyone — companies, agencies, or individual developers — can fork, rebrand, and deploy their own inventory system on top of it without rebuilding the core from scratch.

## Concept

The goal of this project is to provide a solid, ready-to-use inventory management foundation that is free to use and adapt. "White label" means you are welcome to customize the branding, theme, copy, and business rules to fit your own product or your client's product.

**The only condition for using this project (white-labeled or not) is keeping the attribution footer in place.** Every screen must keep a footer crediting the original author with a "Created by..." line linking to:

[Vinícius Nolêto de Araújo — LinkedIn](https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/)

Do not remove or hide this link when reusing, forking, or white-labeling this project.

## Tech Stack

- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [Mantine](https://mantine.dev) (UI components)
- [TanStack Query](https://tanstack.com/query) (data fetching/caching)
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL
- [Yup](https://github.com/jquense/yup) (schema validation)
- [Tailwind CSS](https://tailwindcss.com)
- [i18next](https://www.i18next.com) (internationalization)

## Configuration & Deploy

### Requirements

- Docker + Docker Compose
- Node.js 22+ on the host (only for the Playwright e2e suite)

### Local setup

```bash
cp .env.example .env
make install
```

`make install` builds the image, installs dependencies inside the container, starts `white-label-inventory-system-front` + `white-label-inventory-system-postgres` and runs the migrations. The app is served at `http://localhost:$APP_PORT` (default `3005`) and Postgres listens on `$POSTGRES_PORT` (default `5443`) both inside the Docker network and on the host — pick free ports in `.env` if other projects already use them.

| Command | Effect |
|---|---|
| `make up` / `make down` / `make restart` | Start / stop / restart the containers |
| `make logs` | Follow the app container logs |
| `make shell` | Open a shell inside the app container |
| `make db-migrate` / `make db-generate` / `make db-studio` | Drizzle migrations / new migration / Drizzle Studio |
| `make lint` | Run ESLint |
| `make test` | Run Vitest (unit + API integration) inside the container |
| `make test-coverage` | Same as above with the coverage report (`coverage/`) and thresholds |
| `make test-e2e` | Run the Playwright e2e suite from the host against the running app |

### Tests

- **Unit (`tests/unit`, jsdom)** — utils, hooks, components, services, logics and pages, with `fetch` stubbed.
- **API (`tests/api`, node)** — Route Handlers against a real Postgres database `${POSTGRES_DB}_test`, created and migrated automatically and truncated before each test.
- **E2E (`tests/e2e`, Playwright)** — full user flows against the running app. Every record is named with the `e2e-` prefix and removed before and after the run, so the development data is left untouched. Install the browser once with `npx playwright install chromium`.

### Deploy

`docker-compose.homolog.yml` and `docker-compose.production.yml` use `configs/docker/node/Dockerfile.deploy` (multi-stage build, `next build` with `output: 'standalone'`). Set `APP_ENV` accordingly in `.env`.

## License

This project is free to use, modify, and white-label, provided the attribution footer described above (link to the [author's LinkedIn](https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/)) is kept visible on every screen. See [LICENSE.md](./LICENSE.md) for the full terms.
