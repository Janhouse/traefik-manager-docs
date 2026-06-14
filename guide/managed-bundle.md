# Fully-managed bundle

In managed mode the panel runs and owns **all** of Traefik — both the dynamic config and the **static** config (`traefik.yml`). A single Docker Compose bundle brings up PostgreSQL, the panel, and Traefik together.

## Quick start

You don't need to clone the repo — download the bundle's files and bring it up. The full copy-paste is in the [Quick start](/guide/getting-started#option-a-all-in-one-bundle); in short:

```bash
mkdir traefik-manager && cd traefik-manager && mkdir -p docker/managed
base=https://raw.githubusercontent.com/Janhouse/traefik-proxy-admin/main
curl -fsSL "$base/docker-compose.managed.yml"        -o docker-compose.yml
curl -fsSL "$base/docker/managed/.env.example"       -o .env
curl -fsSL "$base/docker/managed/traefik-wrapper.sh" -o docker/managed/traefik-wrapper.sh
chmod +x docker/managed/traefik-wrapper.sh
# edit .env: set POSTGRES_PASSWORD, MANAGED_SECRETS_KEY, ADMIN_PANEL_AUTH
docker compose up -d
```

(Cloning the repo and running `docker compose -f docker-compose.managed.yml up -d` works too.) Traefik comes up with sensible defaults: a `web` entrypoint on :80 that redirects to `websecure` on :443, and a `letsencrypt` certificate resolver using the TLS challenge.

## How it works

The panel serves Traefik's static config at `GET /api/traefik/static-config`. A small **wrapper script** is the Traefik container's entrypoint; it:

1. Fetches `traefik.yml` from the panel on boot (with a baked-in fallback config if the panel isn't up yet).
2. Starts Traefik.
3. Polls the panel roughly every 30 seconds; when the static config **or** the DNS credentials change, it rewrites the file and **restarts Traefik** (static config cannot be hot-reloaded).

You edit entrypoints and certificate resolvers in the UI's **Managed Traefik** section. A status chip tells you whether Traefik is already running the latest config or still waiting for its restart.

→ Details on the editors: [Global configuration](/guide/global-config)

## Required environment

Set these in your `.env` (see [configuration reference](/reference/configuration) for all options):

| Variable | Purpose |
|---|---|
| `POSTGRES_PASSWORD` | Database password (required). |
| `MANAGED_SECRETS_KEY` | Encrypts DNS-provider credentials at rest. Generate with `openssl rand -base64 32`. |
| `ADMIN_PANEL_AUTH` | HTTP basic-auth users (htpasswd format) that protect the panel — it has no published port of its own. |

Generate a basic-auth entry:

```bash
htpasswd -nB admin
# or, without apache2-utils:
docker run --rm httpd:alpine htpasswd -nB admin
```

::: warning Quote the htpasswd value
bcrypt/apr1 hashes contain `$`. In a Compose `.env` file, wrap the value in single quotes (or escape each `$` as `$$`) so it isn't interpolated:

```bash
ADMIN_PANEL_AUTH='admin:$2y$05$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```
:::

## Security model

- Only Traefik's **:80 and :443** are published. The panel (`:3000`) and Traefik's API (`:8080`) stay on the internal Compose network.
- The panel is reachable from the web only through an **auto-generated Traefik route** on your *Admin Panel Domain*, protected by `ADMIN_PANEL_AUTH` basic auth.
- DNS-challenge provider credentials are **write-only and encrypted at rest** — set them in the UI, never readable back through the web. See [DNS provider credentials](/guide/dns-credentials).

## First-time setup

1. Bring the bundle up. Traefik starts with built-in defaults.
2. Point a DNS record (e.g. `admin.example.com`) at the host.
3. On the **Configuration** page, set the **Admin Panel Domain** to that name and your ACME email under **Managed Traefik**. Traefik restarts within ~30s and the panel becomes reachable at `https://admin.example.com` behind the basic-auth prompt.

## Images & pins

The bundle defaults to `ghcr.io/janhouse/traefik-proxy-admin` (override with `CONFIGURATOR_IMAGE`) and `traefik:v3.7` (override with `TRAEFIK_IMAGE`), and includes a `build:` fallback for running from source.

## When to use externally-managed instead

If you already run Traefik or want full control of the static config (or run on Kubernetes), use [externally-managed mode](/guide/externally-managed) — it's the default, and the managed-mode plumbing stays dormant when `TRAEFIK_MANAGED` is unset.
