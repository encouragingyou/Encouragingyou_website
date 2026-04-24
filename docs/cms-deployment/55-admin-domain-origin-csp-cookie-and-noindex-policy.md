# Prompt 55 - Admin Domain, Origin, CSP, Cookie, And Noindex Policy

## Domain/origin model

The admin portal is now modeled as a separate secure origin, resolved from `ADMIN_ORIGIN_URL`.

The runtime accepts the admin origin from:

1. `ADMIN_ORIGIN_URL`, when explicitly configured
2. forwarded host/proto headers in the live admin service
3. local fallback request origin during development

The public site keeps using `SITE_URL`.

The two origins must stay distinct in hosted environments.

## Admin origin allowlist

[site/src/lib/cms/admin-config.js](/Users/test/Code/new_website/site/src/lib/cms/admin-config.js:1) now defines admin-origin trust like this:

- primary allowed origin is the canonical admin origin
- optional extra origins come from `ADMIN_ADDITIONAL_ALLOWED_ORIGINS`
- local/CI add only explicit loopback development origins

Admin write requests must satisfy both:

- same-origin request checks from [site/src/lib/security/request-guards.js](/Users/test/Code/new_website/site/src/lib/security/request-guards.js:1)
- admin-specific origin allowlisting in [site/src/lib/cms/admin-auth.js](/Users/test/Code/new_website/site/src/lib/cms/admin-auth.js:930)

There is no wildcard cross-origin trust.

## Cookie policy

Admin session cookies are now intentionally narrow:

- host-scoped `__Host-` prefix on secure transport
- `HttpOnly`
- `SameSite=Strict`
- `Secure` when the request is HTTPS
- path `/`

The runtime-managed cookie names are derived from:

- `ey-admin-session`
- `ey-admin-mfa`

Because `__Host-` cookies cannot specify a broader domain, the admin surface does not share broad parent-domain cookies with the public site.

## Route isolation policy

The middleware boundary is explicit:

### On the public surface

- `/admin/*` returns `404`
- `/api/admin/*` returns `404`

### On the admin surface

- `/` redirects to `/admin/`
- public page routes return `404`
- non-admin APIs return `404`
- `/api/health/`, discovery artifacts, and static assets remain reachable

This makes the admin host operationally separate even though it is built from the same codebase.

## Noindex policy

Admin responses are never discoverable through search:

- HTML responses emit `X-Robots-Tag: noindex, nofollow, noarchive`
- admin `robots.txt` is `Disallow: /`
- admin `sitemap.xml` is empty
- deployment metadata marks admin indexing as disabled in [site/src/pages/api/health.ts](/Users/test/Code/new_website/site/src/pages/api/health.ts:1)

The admin surface is therefore intentionally non-public even if someone discovers the hostname.

## Cache policy

Admin responses are also non-cacheable:

- admin routes use `Cache-Control: no-store`
- admin redirects use `Cache-Control: no-store`
- health responses use `Cache-Control: no-store`

That prevents stale authenticated state or route content from being cached as a pseudo-public surface.

## Browser security policy

Admin pages inherit the shared hardened security header stack from [site/src/lib/security/policy.js](/Users/test/Code/new_website/site/src/lib/security/policy.js:1), including:

- `Content-Security-Policy`
- `frame-ancestors 'none'`
- `form-action 'self'`
- `Cross-Origin-Opener-Policy: same-origin`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- HSTS on secure transport

This is compatible with the admin origin split and prevents the admin portal from becoming embeddable or loosely cross-origin by accident.

## Custom domain operational requirement

The final admin hostname is intentionally environment-owned, not hard-coded in repo source. Before production use:

- bind a dedicated admin subdomain to the `encouragingyou-admin` service
- set `ADMIN_ORIGIN_URL` to that exact HTTPS origin
- keep `SITE_URL` pointing only to the public site
- disable or avoid relying on the default `onrender.com` hostname for staff use once the custom admin domain is live

The exact production hostname still needs operational sign-off, but the runtime is now built for that separation.
