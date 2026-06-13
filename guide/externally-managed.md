# Externally-managed Traefik

This is the default mode: **you** run and own Traefik, and the panel supplies only the **dynamic** configuration through Traefik's HTTP provider.

## 1. Add the panel as an HTTP provider

Point Traefik at the panel's dynamic-config endpoint. In Traefik's static configuration:

```yaml
# traefik.yml (your static config — you own this)
providers:
  http:
    endpoint: "http://panel-host:3000/api/traefik/config"
    pollInterval: "10s"
```

Traefik polls that endpoint and applies the routers, services and middlewares the panel generates. Whenever you change something in the UI (or a service auto-disables), the next poll picks it up.

## 2. Define entrypoints and resolvers (you own these)

Because you own the static config, you define entrypoints and any ACME certificate resolvers yourself, for example:

```yaml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: you@example.com
      storage: /acme.json
      dnsChallenge:
        provider: cloudflare
```

In the panel, you then reference these by name — the certificate resolver name on a [domain](/guide/domains-and-certificates), and the entrypoints on a [service](/guide/services) or as the [global default](/guide/global-config).

## 3. (Optional) Give the panel read access to Traefik's API

Set `TRAEFIK_API_URL` to Traefik's API base (e.g. `http://localhost:8080`, exposed via `--api.insecure=true` or routed behind your own auth). This unlocks:

- **Entrypoint and middleware discovery** — the UI offers the entrypoints and middlewares Traefik actually has, instead of free text.
- **Certificate-resolver inference** — the domain form suggests resolver names seen on existing routers/entrypoints.
- **[Runtime explorer, metrics, and route-conflict detection](/guide/runtime-and-metrics).**

Everything degrades gracefully: without `TRAEFIK_API_URL` the panel still generates config, it just can't show live state or offer discovered values.

## 4. The forward-auth address

For [protected services](/guide/authentication), the generated config tells Traefik to call the panel's forward-auth endpoint:

```
http://<adminPanelDomain>/api/auth/verify?serviceId=…&configId=…
```

Set **Admin Panel Domain** on the [global config page](/guide/global-config) to a hostname Traefik can reach the panel at. (In the managed bundle this is handled for you via an internal URL.)

## Production notes

- Run the panel and Postgres however you like (the project publishes a container image at `ghcr.io/janhouse/traefik-proxy-admin`). An example label-based compose for putting the panel behind your existing Traefik is included in the repo.
- The HTTP provider is a single endpoint — anything the panel emits is namespaced and owned by this tool, which is also how conflict detection knows which routers are "yours".
