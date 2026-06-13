# Authentication

Every service chooses how it's protected. Authentication is enforced by Traefik calling the panel's **forward-auth** endpoint on each request, so unauthorized traffic never reaches your backend.

## Methods

- **None** — public access, no authentication.
- **Shared links** — time-limited, one-use links. Opening a valid link creates a session for a configurable duration, then redirects to a clean URL. Great for temporary access without standing accounts.
- **SSO (OIDC)** — OAuth2 / OpenID Connect with group- or user-based authorization. SSO settings are configured in the panel and stored in the database. CSRF is protected via state parameters in the SSO flow.
- **HTTP basic auth** — username/password pairs (htpasswd-style), managed in the panel and attached to a service as a basic-auth middleware.

A service can have more than one security configuration; they're applied in order.

## How it's enforced (forward-auth)

For protected services, the generated router gets a `forwardAuth` middleware pointing at:

```
http://<adminPanelDomain>/api/auth/verify?serviceId=…&configId=…
```

On each request Traefik calls this endpoint, which:

1. Reads the request's forwarded headers and any `traefik-token` (from a shared link).
2. If the service has no enabled security config → allows it.
3. Validates a shared-link token → creates a session and redirects to a clean URL.
4. Validates an existing session cookie → extends it and allows the request.
5. Otherwise returns **401**.

In the [managed bundle](/guide/managed-bundle), Traefik calls this over an internal URL, so it bypasses the basic-auth that protects the panel's own admin route.

## Sessions

- Sessions are **memory-cached with database persistence** for fast validation.
- Tokens are cryptographically secure random values, stored in `httpOnly` cookies.
- Session lifetime is tied to the service's enable/auto-disable settings; expired sessions are cleaned up automatically.
- The **Sessions** page lists active sessions and lets you revoke individual ones or clear them all.

## Panel access vs. service access

Don't confuse the two:

- The auth above protects the **proxied services**.
- The **admin panel itself** is unauthenticated by default in the externally-managed mode (put it behind your own auth). In the **managed bundle**, the panel's own route is protected by HTTP basic auth from `ADMIN_PANEL_AUTH`.
