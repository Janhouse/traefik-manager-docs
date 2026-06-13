# API endpoints

The panel exposes a small HTTP API. The most important ones are the **machine** endpoints Traefik calls; the rest back the UI.

## Traefik integration

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/traefik/config` | **Dynamic** configuration (the HTTP-provider endpoint Traefik polls). Routers, services, middlewares. |
| `GET` | `/api/traefik/static-config` | **Static** `traefik.yml` — managed mode only; `404` otherwise. Read by the bundle's wrapper. |
| `GET` | `/api/traefik/managed` | Managed-mode state: whether managed, the static config, credential **names**, and applied/pending status. `PUT` to update the static config. |
| `GET` | `/api/traefik/managed/secrets-env` | DNS credentials as a shell env file, for the in-network wrapper only — refused via the public domain. |
| `PUT` | `/api/traefik/managed/secrets` | Apply a write-only credential edit batch (returns names only). |
| `GET` | `/api/traefik/entrypoints` | Entrypoints discovered from Traefik's API. |
| `GET` | `/api/traefik/middlewares` | Middlewares discovered from Traefik's API. |
| `GET` | `/api/traefik/cert-resolvers` | Certificate-resolver names inferred from routers/entrypoints (and managed config). |
| `GET` | `/api/traefik/runtime` | Live runtime snapshot (routers/services/middlewares/entrypoints). |
| `GET` | `/api/traefik/metrics` | Per-service traffic metrics. |
| `GET` | `/api/traefik/conflicts` | Route-conflict report. |
| `GET` | `/api/traefik/certificates` | Loaded certificates (Traefik v3.7+). |
| `GET` | `/api/traefik/health` | Backend health for services. |

## Services

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/services` | List services. |
| `POST` | `/api/services` | Create a service. |
| `PUT` | `/api/services/[id]` | Update a service. |
| `DELETE` | `/api/services/[id]` | Delete a service. |
| `GET`/`POST`/`DELETE` | `/api/services/[id]/security-configs` | Per-service security (basic auth, SSO, shared links). |

## Domains

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/domains` | List domains. |
| `POST` | `/api/domains` | Create a domain. |
| `PUT` | `/api/domains/[id]` | Update a domain. |
| `DELETE` | `/api/domains/[id]` | Delete a domain. |

## Authentication & sessions

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/auth/verify` | **Forward-auth** endpoint Traefik calls per request. |
| `GET` | `/api/sessions` | List active sessions. |
| `DELETE` | `/api/sessions` | Delete all sessions. |

## Global config & system

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/config` | Global configuration (admin panel domain, default entrypoints, global middlewares). |
| `PUT` | `/api/config` | Update global configuration. |
| `GET` | `/api/system` | Lightweight flags for the UI (e.g. whether managed mode is on). |
| `GET` | `/api/health` | Health check (used by the container healthcheck). |

::: info
Endpoint shapes can evolve; treat `GET /api/traefik/config` and `GET /api/auth/verify` as the stable integration contract with Traefik. The rest exist primarily for the UI.
:::
