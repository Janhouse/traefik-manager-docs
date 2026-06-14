# Quick start

Run Traefik Proxy Admin with Docker — no need to clone the source. Pick the path that matches how you want to run Traefik:

- **All-in-one bundle** — the panel runs Traefik for you. Easiest if you're starting fresh.
- **Bring your own Traefik** — run just the panel + database next to a Traefik you already operate.

Not sure which? See [Deployment modes](/guide/deployment-modes).

::: tip Developing or contributing?
This page is for **running** the app. To work on the code (clone, `pnpm`, dev server), see [Development setup](/guide/development).
:::

::: warning Download links
The download URLs below point at the project's `main` branch. They become live once the Docker bundle is merged to `main`; until then, replace `main` with `redesign/traefik-ui` in the URLs.
:::

## Option A — All-in-one bundle

The [fully-managed bundle](/guide/managed-bundle) brings up PostgreSQL + the panel + Traefik together, with the panel owning Traefik's configuration end to end. Download the three files it needs into a folder:

```bash
mkdir traefik-manager && cd traefik-manager
mkdir -p docker/managed
base=https://raw.githubusercontent.com/Janhouse/traefik-proxy-admin/main
curl -fsSL "$base/docker-compose.managed.yml"        -o docker-compose.yml
curl -fsSL "$base/docker/managed/.env.example"       -o .env
curl -fsSL "$base/docker/managed/traefik-wrapper.sh" -o docker/managed/traefik-wrapper.sh
chmod +x docker/managed/traefik-wrapper.sh
```

Edit `.env` and set the three required values:

```bash
POSTGRES_PASSWORD=        # any strong password — e.g. openssl rand -hex 24
MANAGED_SECRETS_KEY=      # encrypts DNS credentials at rest — openssl rand -base64 32
ADMIN_PANEL_AUTH=         # htpasswd entry that protects the panel (see below)
```

Generate the panel login (single-quote it so `$` in the hash isn't interpolated):

```bash
docker run --rm httpd:alpine htpasswd -nB admin
# → ADMIN_PANEL_AUTH='admin:$2y$05$....'
```

Then start it:

```bash
docker compose up -d
```

Traefik comes up with sensible defaults (`web` :80 → redirect to `websecure` :443, a Let's Encrypt resolver). The panel image is pulled from `ghcr.io/janhouse/traefik-proxy-admin`. Finish setup (Admin Panel Domain, ACME email, DNS) following [Fully-managed bundle](/guide/managed-bundle#first-time-setup).

## Option B — Bring your own Traefik

If you already run Traefik, run just the panel and its database, and add the panel as an HTTP provider. Create a `docker-compose.yml`:

```yaml
name: traefik-proxy-admin
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: traefik_share
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD in .env}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "admin"]
      interval: 10s
      timeout: 3s
      retries: 5

  panel:
    image: ghcr.io/janhouse/traefik-proxy-admin:latest
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://admin:${POSTGRES_PASSWORD}@postgres:5432/traefik_share
      # Optional — enables the runtime explorer, metrics and conflict detection:
      # TRAEFIK_API_URL: http://your-traefik:8080
    ports:
      - "3000:3000" # so your Traefik can reach the panel (or use a shared network)
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

Set `POSTGRES_PASSWORD` in a `.env` next to it, then:

```bash
docker compose up -d
```

Finally point Traefik's HTTP provider at the panel and reference your entrypoints/resolvers — see [Externally-managed Traefik](/guide/externally-managed).

## Updating

Pull the latest panel image and recreate the containers:

```bash
docker compose pull
docker compose up -d
```

For the all-in-one bundle, re-download the files (same `curl` commands) if the bundle's structure changes between releases; your `.env` and data volumes are preserved.

## Next steps

- Choose how to run Traefik: [Deployment modes](/guide/deployment-modes)
- Create your first proxied service: [Services & routing](/guide/services)
- Add a domain and certificates: [Domains & certificates](/guide/domains-and-certificates)
