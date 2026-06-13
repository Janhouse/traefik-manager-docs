# Configuration & env vars

All configuration is via environment variables (most have sensible defaults). Per-service, domain, and global settings live in the database and are edited in the UI.

## Core

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://admin:password@localhost:5432/traefik_share` | PostgreSQL connection string. Required in production. |
| `DB_CONNECTION_LIMIT` | `10` | Connection pool size. |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Public base URL of the panel. |
| `NODE_ENV` | — | `production` enables secure cookies, etc. |

## Traefik API (optional, externally-managed)

Set these to enable the runtime explorer, metrics, conflict detection, and discovery of entrypoints/middlewares/resolvers. Everything degrades gracefully when unset.

| Variable | Default | Notes |
|---|---|---|
| `TRAEFIK_API_URL` | — | Base URL of Traefik's API, e.g. `http://localhost:8080`. |
| `TRAEFIK_METRICS_URL` | `${TRAEFIK_API_URL}/metrics` | Prometheus metrics endpoint. |
| `TRAEFIK_METRICS_INTERVAL_SECONDS` | `60` | Scrape interval. |
| `TRAEFIK_METRICS_RETENTION_MINUTES` | `180` | Sample retention window. |

## Managed mode

Used only by the [fully-managed bundle](/guide/managed-bundle). The managed plumbing stays dormant unless `TRAEFIK_MANAGED=true`.

| Variable | Default | Notes |
|---|---|---|
| `TRAEFIK_MANAGED` | `false` | `true` turns on managed mode (the panel owns Traefik's static config). |
| `MANAGED_SECRETS_KEY` | — | Encrypts DNS-provider credentials at rest (AES-256-GCM). Generate with `openssl rand -base64 32`. Without it, credentials are stored unencrypted (a warning is logged). Rotating it invalidates stored credentials. |
| `MANAGED_SECRETS_FILE` | `<cwd>/.managed-secrets.enc` | Where the encrypted credential file lives (the bundle sets `/data/managed-secrets.enc` on a volume). |
| `ADMIN_PANEL_AUTH` | — | HTTP basic-auth users (htpasswd entries, comma/newline separated) protecting the panel's auto-generated Traefik route. Quote the value so `$` in hashes isn't interpolated. |
| `PANEL_INTERNAL_URL` | `http://<adminPanelDomain>` | Internal URL Traefik uses for forward-auth and cert-trigger callbacks; in the bundle it's the panel's container address so those calls bypass the panel's basic auth. |

### Bundle Compose variables

| Variable | Default | Notes |
|---|---|---|
| `POSTGRES_PASSWORD` | — | Required by `docker-compose.managed.yml`. |
| `POSTGRES_USER` / `POSTGRES_DB` | `admin` / `traefik_share` | Database name/user. |
| `CONFIGURATOR_IMAGE` | `ghcr.io/janhouse/traefik-proxy-admin:latest` | Panel image (override or use the `build:` fallback). |
| `TRAEFIK_IMAGE` | `traefik:v3.7` | Traefik image. |

DNS-challenge provider credentials are best set in the UI (write-only, encrypted). You can still hard-code them as env vars on the `traefik` service if you prefer.

## Database & migrations

Migrations run automatically on startup (Next.js `instrumentation.ts`). For development:

```bash
pnpm db:generate   # generate a migration from schema changes
pnpm db:push       # push schema changes
pnpm db:studio     # open Drizzle Studio
```
