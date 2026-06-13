# FAQ

## Do I have to let the panel run Traefik?

No. The default is [externally-managed mode](/guide/externally-managed): you run Traefik and the panel only supplies dynamic config via the HTTP provider. The [fully-managed bundle](/guide/managed-bundle) is opt-in (`TRAEFIK_MANAGED=true`).

## Can I have an HTTP-only setup (no TLS)?

Yes. An entrypoint is just a listener — "HTTP vs HTTPS" is the **TLS by default** toggle, not a separate type. Keep one entrypoint (e.g. `web` on :80) with TLS off. You need at least one entrypoint.

## Can it manage TCP or UDP services?

Not currently. The panel is an HTTP reverse-proxy admin — its services, routers, and the dynamic config it generates are all HTTP. Traefik itself supports TCP/UDP routers, but you'd define those through another provider (file or Docker labels). The runtime explorer will still *show* TCP/UDP routers Traefik has from other providers; it just can't create them.

## How do I use multiple accounts of the same DNS provider (e.g. two Cloudflare accounts)?

You can't give two `cloudflare` resolvers different tokens in a single Traefik — it reads each provider's credentials from process-global environment variables ([traefik#5472](https://github.com/traefik/traefik/issues/5472), closed without implementation). Options:

- **Same account, multiple zones** → one API token scoped to all zones, one resolver.
- **Different accounts** → CNAME-delegate `_acme-challenge` records to one zone your token controls (lego follows the CNAME), or use lego's `exec`/`httpreq` provider with a script that routes by domain, or run a separate Traefik instance per account.

See [DNS provider credentials](/guide/dns-credentials).

## Are my DNS credentials safe?

In managed mode they're **write-only through the web** and **encrypted at rest** (AES-256-GCM, keyed by `MANAGED_SECRETS_KEY`) in a file — not in the database, which keeps only their names. They can be set/replaced via the UI but never read back; only the in-network Traefik wrapper can fetch them to inject as environment variables. See [DNS provider credentials](/guide/dns-credentials).

## How are certificates obtained?

The panel doesn't handle private keys. It tells Traefik which **certificate resolver** (an ACME resolver in Traefik's static config) a domain uses, and Traefik issues and renews certificates itself. Wildcards require a DNS challenge.

## Why did my service show up as a "conflict" momentarily?

Traefik re-polls the panel every few seconds. Right after you change a service's entrypoints, a stale router can briefly overlap the new one; it clears on the next poll. Hard conflicts (a *different* router on the same host+entrypoint) are flagged and block saving. See [Runtime & metrics](/guide/runtime-and-metrics).

## Does enabling TLS change the port automatically?

In the managed-mode entrypoint editor, yes — toggling **TLS by default** moves the canonical port (unset/80 ↔ 443). A custom port (e.g. 8443) is left untouched.

## Is the admin panel itself authenticated?

In externally-managed mode it's unauthenticated by default — put it behind your own auth. In the managed bundle, its auto-generated Traefik route is protected by HTTP basic auth from `ADMIN_PANEL_AUTH`.

## Where do I report issues or contribute?

On the project repository: [github.com/Janhouse/traefik-proxy-admin](https://github.com/Janhouse/traefik-proxy-admin).
