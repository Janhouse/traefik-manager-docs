# Getting started

This page gets the panel running locally for development or evaluation. If you just want a working stack with Traefik included, jump to the [fully-managed bundle](/guide/managed-bundle).

## Prerequisites

- **Node.js 20+** and **pnpm** (the project uses pnpm, not npm).
- **PostgreSQL** (a Docker Compose file is provided for local development).
- A **Traefik** instance if you want to serve real traffic — though you can run and click around the panel without one.

## 1. Clone and install

```bash
git clone https://github.com/Janhouse/traefik-proxy-admin
cd traefik-proxy-admin
pnpm install
```

## 2. Start PostgreSQL

```bash
docker compose up -d   # starts the local Postgres
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

See the [configuration reference](/reference/configuration) for every variable.

## 4. Run the panel

```bash
pnpm dev
```

The admin panel is available at `http://localhost:3000`.

::: tip Migrations run automatically
Database migrations are applied on startup (via Next.js `instrumentation.ts`), so you don't run a migrate step by hand. To create a new migration after changing the schema, use `pnpm db:generate`; to push schema changes directly during development, `pnpm db:push`.
:::

## 5. Point Traefik at the panel

Configure Traefik's HTTP provider to poll the panel, then create a service in the UI. The full setup — including entrypoints, certificate resolvers, and the optional API access — is in [Externally-managed Traefik](/guide/externally-managed).

## Useful commands

```bash
pnpm dev          # start the dev server (port 3000)
pnpm build        # production build
pnpm lint         # lint
pnpm db:generate  # generate a new Drizzle migration from schema changes
pnpm db:push      # push schema changes to the database
pnpm db:studio    # open Drizzle Studio
```

## Next steps

- Decide how to run Traefik: [Deployment modes](/guide/deployment-modes)
- Create your first proxied service: [Services & routing](/guide/services)
- Add a domain and certificates: [Domains & certificates](/guide/domains-and-certificates)
