# DNS provider credentials

DNS-challenge certificate resolvers (required for wildcard certs) need API credentials for your DNS provider. In the **fully-managed bundle**, you set these in the panel — and they are handled as **write-only secrets**.

> This feature applies to [managed mode](/guide/managed-bundle). In externally-managed mode you provide provider credentials to your own Traefik (typically as environment variables) just as you do today.

## Pick a provider, get the right fields

Traefik (via [lego](https://go-acme.github.io/lego/dns/)) reads each provider's credentials from specific environment variables — `CF_DNS_API_TOKEN` for Cloudflare, `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` for Route 53, and so on. You shouldn't have to memorise those.

In a resolver's **DNS challenge** settings, choose your provider from the list and the panel shows **exactly that provider's credential fields**, each labelled and annotated with its environment-variable name and whether it's required. A catalog of common providers is built in; anything else is reachable via **Other (custom)**, where you enter the lego provider code and add its variables under **All stored credentials**.

## Write-only and encrypted at rest

This is the important part:

- You can **set** or **replace** a credential through the web, but its value is **never returned**. Existing credentials show only as "set"; the API and UI only ever expose credential **names**.
- Values are stored **encrypted at rest** (AES-256-GCM) in a file on the panel's data volume — **not** in the database. Only credential names (and a hash) are kept in the database.
- The encryption key comes from `MANAGED_SECRETS_KEY`. Keep it stable: rotating it makes existing stored credentials unreadable (just re-enter them).
- The values leave the database only through one in-network endpoint that the Traefik wrapper reads to inject them as environment variables on (re)start. That endpoint **refuses any request that arrives via the public domain**, so credentials can't be read back through the web — only the wrapper, on the internal network, can fetch them.

When you change credentials, the wrapper restarts Traefik so the new environment takes effect.

## Multiple accounts of the same provider

Want **different tokens for different domains** on the same provider (e.g. two Cloudflare accounts)? That's a Traefik limitation, not a panel one: Traefik reads each provider's credentials from **process-global** environment variables, so two `cloudflare` resolvers would both read the same `CF_DNS_API_TOKEN`. The per-resolver-credentials request ([traefik#5472](https://github.com/traefik/traefik/issues/5472)) was closed without implementation.

Workarounds:

- **Same account, multiple zones:** issue one API token scoped to all the zones and use a single resolver — no need for multiple tokens.
- **Different accounts:** CNAME-delegate the `_acme-challenge` records to a single zone your one token controls (lego follows the CNAME), **or** use lego's `exec` / `httpreq` provider with a small script that picks the right token per domain, **or** run a separate Traefik instance per account.

See the [FAQ](/faq) for a shorter version of this.
