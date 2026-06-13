# Global configuration

The **Configuration** page holds settings that apply across the whole panel, plus — in managed mode — the editors for Traefik's static configuration.

## Panel & defaults

- **Admin Panel Domain** — the hostname Traefik uses to reach the panel for forward-auth and certificate-trigger callbacks. Set it to something Traefik can resolve.
- **Default service duration** — the auto-disable timer pre-filled when creating new services ("Forever" to keep them on).

## Default entrypoints

Entrypoints used when a service has **no** entrypoints selected. This is a multi-select: a service with no explicit entrypoints gets one router per default entrypoint, and certificate-trigger routers bind to the TLS ones. (Picker fed by Traefik's API when `TRAEFIK_API_URL` is set.)

## Global middlewares

Middlewares applied to **every** service, in order, before any service-specific middlewares. Pick them from the middlewares the panel discovers from the Traefik API — the same selector used on the service form.

## Managed Traefik (managed mode only)

When `TRAEFIK_MANAGED=true`, a fourth section appears where the panel owns the **static** config. Saving here rewrites `traefik.yml`; the bundled wrapper restarts Traefik on its next poll.

### Entrypoints

Rows of `name` + `port`, with:

- **TLS by default** — toggling it nudges the port along the canonical pair (unset/80 ↔ 443; a custom port is left alone) and reveals a certificate-resolver picker.
- **Certificate resolver** — chosen from the resolvers you define below (plus "No automatic certificate"); it is **not** inferred from a running Traefik, so the choice always matches a resolver that actually exists in this config.
- **Redirect to** — emit an HTTP→HTTPS redirection toward another entrypoint.

### Certificate resolvers

ACME accounts Traefik uses to obtain certificates: `name`, ACME `email`, and a **challenge** (TLS / HTTP / DNS). DNS-challenge resolvers also pick a provider and get a guided credential editor — see [DNS provider credentials](/guide/dns-credentials). Storage is per-resolver under `/data`.

### Status & restart

A status chip shows whether Traefik is already running the saved config or **waiting for its restart** (the wrapper applies changes within ~30s). A warning appears if `ADMIN_PANEL_AUTH` isn't set, since the panel's route would then be published without authentication.

Credentials and static config are saved **independently** — a rejected static config never blocks a credential change, and your in-progress edits are preserved so you can fix and resave.
