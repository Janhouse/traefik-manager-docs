# Architecture

A high-level look at how the pieces fit together.

## Components

- **Admin panel** — a Next.js (App Router, TypeScript) application. Server routes generate Traefik config and handle forward-auth; the UI is React + shadcn/ui + Tailwind, with `next-themes` for dark mode.
- **PostgreSQL** — the source of truth, accessed through Drizzle ORM. Migrations apply on startup.
- **Traefik** — the proxy. It polls the panel for dynamic config and (in managed mode) is fed its static config by the panel via a wrapper script.

## Data model (overview)

| Table | Holds |
|---|---|
| `services` | Proxied services: target, routing rules, entrypoints, middlewares, lifecycle. |
| `domains` | Base domains: certificate resolver, wildcard flag, extra certificate configs. |
| `sessions` | Active auth sessions (also memory-cached). |
| `shared_links` | Time-limited one-use access links. |
| `app_config` | Global configuration, SSO settings, managed static config + credential metadata (key/value JSON). |
| (security configs) | Per-service security (basic auth users, SSO/shared-link config). |

## Dynamic-config generation

On each `GET /api/traefik/config`:

1. Expired services are auto-disabled.
2. Enabled services (joined with their domain) are read, sorted deterministically (so identifier-collision suffixes are stable).
3. Each service yields a Traefik service + one router per selected entrypoint (TLS only on TLS entrypoints), plus its middlewares (global → auth → headers → per-service).
4. Domains contribute wildcard/cert-trigger routers (path-scoped so they never steal real traffic), bound to TLS entrypoints.
5. In managed mode, an admin-panel router is added so the panel itself is reachable through Traefik behind basic auth.

The forward-auth address and cert-trigger callbacks use `PANEL_INTERNAL_URL` when set, falling back to the public admin domain — so externally-managed output is unchanged when the managed variables are absent.

## Managed static-config lifecycle

```
 panel  ──GET /api/traefik/static-config──▶  wrapper (in Traefik container)
   ▲                                              │ writes traefik.yml
   │  GET /api/traefik/managed/secrets-env        │ sources env, starts traefik
   │  (internal only)                             ▼
   └──────────────────────────────────────  Traefik  (restarted on change)
```

- The panel builds `traefik.yml` from the managed config stored in `app_config` (entrypoints + ACME resolvers + fixed sane defaults: API, Prometheus metrics, the HTTP provider).
- The wrapper polls the static-config and credentials endpoints (~30s), and **restarts Traefik** when either changes (static config can't be hot-reloaded).
- DNS credentials live encrypted in a file (not the DB); only credential **names + a hash** are stored in `app_config`, which is enough for the UI and to compute the "restart pending" status without decrypting.

## Trust & security boundaries

- The panel's dynamic-config endpoint is the single HTTP provider; everything it emits is owned by this tool (which is how conflict detection attributes routers).
- In the bundle, only Traefik's :80/:443 are public; the panel and Traefik API are internal-only. The credentials endpoint additionally refuses any request that arrived via the public domain, so secrets are write-only through the web.
