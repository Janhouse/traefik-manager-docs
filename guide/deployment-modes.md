# Deployment modes

The panel runs in one of two modes. They share the same UI and the same dynamic-configuration engine; the difference is **who owns Traefik's static configuration**.

## At a glance

| | Externally-managed (default) | Fully-managed bundle |
|---|---|---|
| Who runs Traefik | You | The bundle (`docker compose`) |
| Static config (entrypoints, ACME resolvers) | **You** own it | **The panel** owns it |
| Dynamic config (routers, services, middlewares) | Panel (HTTP provider) | Panel (HTTP provider) |
| Restart Traefik on static change | You | Automatic (wrapper script) |
| Setup effort | Wire one HTTP provider | One `docker compose up` |
| Best for | Existing Traefik installs, full control | Greenfield, "just give me HTTPS" |
| Enabled by | default | `TRAEFIK_MANAGED=true` |

## Externally-managed Traefik (default)

You already run Traefik (standalone, in Docker, in Kubernetes, wherever). You keep ownership of its **static** config — entrypoints, certificate resolvers, TLS options — and simply add the panel as an **HTTP provider** so it supplies the **dynamic** config (routers/services/middlewares).

This is the most flexible option and changes nothing about how you operate Traefik today. Optionally point `TRAEFIK_API_URL` at Traefik's API to light up the runtime explorer, metrics, and conflict detection.

→ [Set up externally-managed Traefik](/guide/externally-managed)

## Fully-managed bundle

A single `docker-compose.managed.yml` brings up **PostgreSQL + the panel + Traefik** together. Here the panel also owns Traefik's **static** config: you edit entrypoints and certificate resolvers in the UI, and a small wrapper in the Traefik container fetches `traefik.yml` from the panel and **restarts Traefik automatically** when it changes (static config can't be hot-reloaded).

It ships with sane defaults (`web` :80 → redirect to `websecure` :443 with a Let's Encrypt resolver), write-only encrypted DNS-challenge credentials, and HTTP basic auth for the panel itself. Only ports 80/443 are published.

→ [Run the fully-managed bundle](/guide/managed-bundle)

## Which should I pick?

- **Already have Traefik**, or want full control over the static config / run on Kubernetes → **externally-managed**.
- **Starting fresh** and want HTTPS and a managed Traefik with the least setup → **fully-managed bundle**.

The externally-managed mode is the default, and nothing about it changes when the managed-mode environment variables are unset — the managed plumbing stays completely dormant.
