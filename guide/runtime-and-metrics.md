# Runtime & metrics

When the panel can read Traefik's API (`TRAEFIK_API_URL` set), it adds live operational views on top of the configuration you manage.

## Runtime explorer

Browse Traefik's **live runtime state** — HTTP/TCP/UDP routers and services, middlewares, entrypoints, and (on Traefik v3.7+) loaded certificates with expiry. It reflects everything Traefik currently has, regardless of which provider produced it, so you can see how the panel's generated config landed alongside anything from other providers.

> The explorer is read-only for routes from other providers. The panel only *manages* HTTP services it created; TCP/UDP routers from other providers are shown but not editable here.

## Traffic metrics

The panel scrapes Traefik's Prometheus metrics and shows **per-service traffic** — request rate over the last hour as a small histogram, error rate, and latency where available. Split routers (one per entrypoint) are summed so a service's numbers read as a whole.

Tuning (all optional):

- `TRAEFIK_METRICS_URL` — defaults to `${TRAEFIK_API_URL}/metrics`.
- `TRAEFIK_METRICS_INTERVAL_SECONDS` — scrape interval (default 60).
- `TRAEFIK_METRICS_RETENTION_MINUTES` — how long samples are kept (default 180).

Metrics require Traefik's Prometheus metrics to be enabled with router/service/entrypoint labels. The [managed bundle](/guide/managed-bundle) turns these on for you.

## Route-conflict detection

Two routers matching the **same host on overlapping entrypoints** will fight. The panel compares the routers it generates against Traefik's live routers and flags conflicts:

- In the **service editor**, you're warned when your host+entrypoint overlaps another router (and saving is blocked on a hard conflict).
- The detector maps live router names back to the owning service, including the per-entrypoint split-router names and any collision-suffixed names, so a service's *own* routers are never mistaken for foreign conflicts.
- Routers from the panel's own HTTP provider are treated as internal (this tool owns the single HTTP provider), so its cert-trigger and admin routers don't surface as conflicts.

Because Traefik re-polls the panel every few seconds, a transient conflict — e.g. right after you change a service's entrypoints — clears itself on the next cycle.
