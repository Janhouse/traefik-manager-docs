# Services & routing

A **service** is one thing you expose through Traefik: a hostname (and optional path/header rules) that routes to a backend at some IP and port.

## Creating a service

Each service has:

- **Name** — a human label, also used to derive the generated router/service names.
- **Target** — the backend `IP` and `port`, with a *Target uses HTTPS* toggle and an optional **Host header override** for virtual-hosted backends.
- **Match rule** — what requests this service answers (see below).
- **Entrypoints** — which Traefik entrypoints it binds to.
- **Middlewares** — global ones plus any per-service ones.
- **Lifecycle** — enabled/disabled and an optional auto-disable timer.

## The rule builder

Routing rules are composed visually rather than written as Traefik rule strings. The first rule is usually a **Host** rule, built from a managed [domain](/guide/domains-and-certificates) (pick the domain + subdomain, or apex) or a custom hostname. You then refine with additional matchers:

- **Host**, **Path**, **PathPrefix**, **Header**, **Method**, **Query**, **ClientIP**, …
- Combine them with **AND/OR**, and group them into **nested groups** (up to two levels) to build parenthesized expressions like `(Host(a) || Host(b)) && PathPrefix(/api)`.
- Drag to reorder; the **generated router rule** and the resulting public URL are previewed live as you edit.

## Entrypoints

Traefik can't bind one router with TLS to both a plain-HTTP and an HTTPS entrypoint, so the panel generates **one router per selected entrypoint** — all sharing the same rule, service and middlewares, with **TLS applied only on TLS entrypoints**. Leave the selection empty to fall back to the [global default entrypoints](/guide/global-config).

The dedicated `traefik` API/dashboard entrypoint is hidden from the picker (it shouldn't carry application traffic) unless a service already uses it.

## Auto-disable timer

A service can carry an **auto-disable duration**. When it elapses, the service is disabled and drops out of the generated config on the next poll — handy for temporary exposure. "Forever" keeps it on indefinitely.

## Share links

For services protected by a [shared link](/guide/authentication), you can generate a **time-limited, one-use link** that creates a session when opened — a quick way to grant temporary access without setting up SSO.

## What gets generated

For each enabled service the panel emits, into `GET /api/traefik/config`:

- a **service** (`service-<id>`) pointing at your backend (with an insecure-skip-verify transport if you enabled HTTPS without cert validation),
- one or more **routers** (`router-<id>` or `router-<id>-<entrypoint>`),
- any **middlewares** the service needs (auth, basic-auth, header overrides), in order.

Conflicts with other routers (same host + overlapping entrypoint) are surfaced in the editor and on the [runtime page](/guide/runtime-and-metrics).
