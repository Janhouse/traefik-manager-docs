# Development setup

This page is for **working on the project** — running it from source, changing code, and contributing. If you just want to *run* it, use the Docker [Quick start](/guide/getting-started) instead.

## Prerequisites

- **Node.js 22+** and **pnpm** (the project uses pnpm, not npm).
- **Docker** (for a local PostgreSQL — or bring your own Postgres).
- Optionally a **Traefik** instance to serve real traffic; the panel runs fine without one for UI work.

## 1. Clone and install

```bash
git clone https://github.com/Janhouse/traefik-proxy-admin
cd traefik-proxy-admin
pnpm install
```

## 2. Start PostgreSQL

A Compose file for local Postgres is included:

```bash
docker compose up -d   # local Postgres only
```

## 3. Configure the environment

```bash
cp .env.example .env
```

The defaults work for local development:

```bash
DATABASE_URL=postgresql://admin:password@localhost:5432/traefik_share
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Optional — enables the runtime explorer, metrics and conflict detection:
TRAEFIK_API_URL=http://localhost:8080
```

See the [configuration reference](/reference/configuration) for every variable, including managed-mode ones (`TRAEFIK_MANAGED`, `MANAGED_SECRETS_KEY`, `ADMIN_PANEL_AUTH`, …).

## 4. Run the dev server

```bash
pnpm dev
```

The panel is at `http://localhost:3000`.

::: tip Migrations run automatically
Migrations are applied on startup (via Next.js `instrumentation.ts`) — no separate migrate step. After changing the schema, run `pnpm db:generate` to create a migration, or `pnpm db:push` to push changes directly during development.
:::

To exercise **managed mode** locally, start the dev server with the managed environment set:

```bash
TRAEFIK_MANAGED=true MANAGED_SECRETS_KEY=dev-key pnpm dev
```

## Useful commands

```bash
pnpm dev          # start the dev server (port 3000)
pnpm build        # production build
pnpm lint         # lint
pnpm test         # run the test suite
pnpm db:generate  # generate a new Drizzle migration from schema changes
pnpm db:push      # push schema changes to the database
pnpm db:studio    # open Drizzle Studio
```

## Tech stack

- **Next.js** (App Router, TypeScript) — UI and server routes.
- **PostgreSQL** + **Drizzle ORM** — persistence and migrations.
- **shadcn/ui** + **Tailwind CSS** + **next-themes** — interface and dark mode.
- **Geist** font.

## Where things live

- `app/api/traefik/config` — the dynamic-config endpoint Traefik polls.
- `app/api/auth/verify` — the forward-auth endpoint.
- `lib/traefik-config.ts` — dynamic-config generation.
- `lib/managed-traefik.ts` — managed-mode static-config builder.
- `db/schema.ts` — the database schema.
- `docker/managed/` + `docker-compose.managed.yml` — the fully-managed bundle.

For the bigger picture, see [Architecture](/reference/architecture). Issues and pull requests are welcome on [GitHub](https://github.com/Janhouse/traefik-proxy-admin).
