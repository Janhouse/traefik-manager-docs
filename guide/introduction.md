# Introduction

**Traefik Proxy Admin** is a web panel for managing a [Traefik](https://traefik.io/) reverse proxy. Instead of hand-editing YAML or sprinkling labels across containers, you describe your services, routing rules, domains, certificates and authentication in a UI, and the panel produces Traefik's configuration for you.

## The problem it solves

Traefik is configured from two places:

- **Static configuration** — entrypoints (the ports it listens on), certificate resolvers (ACME), providers, API/dashboard. Read once at startup; changing it requires a restart.
- **Dynamic configuration** — routers, services, middlewares, TLS. Hot-reloaded continuously from a *provider* (files, Docker labels, an HTTP endpoint, …).

Editing these by hand is error-prone, and there's no built-in UI for "expose this internal service at this hostname, behind login, with a certificate." This panel fills that gap: it is a **dynamic-configuration provider with a UI** — and, optionally, the owner of the static configuration too.

## How it works

```
┌─────────────────┐      ┌──────────────┐         ┌─────────────────┐
│   Admin panel   │─────▶│  PostgreSQL  │         │     Traefik     │
│   (Next.js)     │      │  (services,  │         │   reverse proxy │
│                 │      │   domains,   │         └────────┬────────┘
│  GET /api/      │◀─────────  sessions,│   polls          │ routes
│  traefik/config │      │   config)    │   HTTP provider   ▼
└─────────────────┘      └──────────────┘         ┌─────────────────┐
        ▲                                          │ Target services │
        │  forward-auth (/api/auth/verify)         │  (HTTP/HTTPS)   │
        └──────────────────────────────────────────└─────────────────┘
```

1. You manage everything in the panel; it persists to **PostgreSQL**.
2. Traefik polls the panel's HTTP provider endpoint, `GET /api/traefik/config`, and applies the generated routers / services / middlewares.
3. For protected services, Traefik calls the panel's **forward-auth** endpoint (`/api/auth/verify`) on every request to decide whether to allow it.
4. Optionally, the panel reads Traefik's own API to power the runtime explorer, traffic metrics, and route-conflict detection.

## What you can manage

- **Services & routing** — target IP/port, a visual rule builder (Host / Path / Header / method, nested AND/OR groups), entrypoint selection, auto-disable timers, and one-click share links.
- **Domains & certificates** — base domains, wildcard certificates, per-domain certificate resolvers, and extra certificate configurations.
- **Authentication** — none, time-limited shared links, SSO (OIDC), or HTTP basic auth, enforced via Traefik forward-auth.
- **Global configuration** — admin panel domain, default entrypoints, and global middlewares applied to every service.
- **Runtime & metrics** — a live view of Traefik's routers/services, per-service traffic, and conflict detection.

## Two ways to run it

The panel works alongside a Traefik you already operate, **or** as a self-contained bundle that runs Traefik for you and manages its static config as well. See [Deployment modes](/guide/deployment-modes) to choose.

Ready to try it? Head to [Getting started](/guide/getting-started).
