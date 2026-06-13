# Domains & certificates

A **domain** is a base hostname (e.g. `example.com`) that services attach to. Domains carry the certificate settings, so TLS is configured per-domain rather than per-service.

## Managing domains

Each domain has:

- **Name** and **Domain** (the base hostname).
- **Certificate resolver** — the name of a Traefik ACME resolver that issues certificates for this domain.
- **Use wildcard certificate** — request a `*.example.com` certificate so individual subdomain names don't leak into Certificate Transparency logs.
- **Default domain** — pre-selected when creating new services.
- **Certificate configurations** — optional extra certificates (each with its own main domain, SANs, and resolver) for non-wildcard setups.

A service's Host rule references a domain, so its public hostname becomes `subdomain.domain` (or the apex).

## Certificate resolver field

The resolver is the **name** of a resolver defined in Traefik's static config. How you pick it depends on the mode:

- **Externally-managed:** the field suggests resolver names **inferred from your running Traefik** (from existing routers' and entrypoints' `tls.certResolver`), since the panel doesn't own the static config. Free text is always allowed, because Traefik exposes no API listing resolvers and inference can't see ones nothing references yet.
- **Fully-managed:** resolvers are the ones you define in the **Managed Traefik** section, so an entrypoint's resolver is chosen from that list. See [Global configuration](/guide/global-config).

## Wildcard certificates

When **Use wildcard certificate** is on, the panel asks Traefik to obtain `*.example.com` (plus the apex). To trigger issuance even before any service exists, it emits a tiny **path-scoped cert-trigger router** for the domain — scoped to a `/.well-known/...` path so it never steals real traffic — and binds it only to TLS entrypoints. Wildcards require a **DNS challenge**, which means [DNS provider credentials](/guide/dns-credentials).

## How TLS reaches Traefik

For each service on a TLS entrypoint, the generated router carries the domain's `tls.certResolver` (and the wildcard `domains` block when wildcard is enabled). Traefik then obtains and renews the certificate through its ACME resolver — the panel never handles private keys or `acme.json` itself.

## Challenge types

The certificate resolver uses one of Traefik's ACME challenges:

- **TLS challenge** — simplest; needs the `:443` entrypoint reachable from the internet.
- **HTTP challenge** — needs the `:80` entrypoint reachable.
- **DNS challenge** — required for **wildcard** certs and for hosts not publicly reachable; needs provider API credentials → [DNS provider credentials](/guide/dns-credentials).
