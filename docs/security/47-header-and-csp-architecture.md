# Prompt 47 - Header And CSP Architecture

## Shared header model

Prompt 47 centralizes browser hardening in `site/src/middleware.ts` and `site/src/lib/security/policy.js`.

Applied on all responses:

- `Cross-Origin-Opener-Policy: same-origin`
- `Origin-Agent-Cluster: ?1`
- `Permissions-Policy: camera=(), geolocation=(), microphone=(), payment=(), usb=()`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-Permitted-Cross-Domain-Policies: none`

Applied on HTTPS requests only:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

Applied on HTML responses only:

- `Content-Security-Policy`

## CSP strategy

The site is mostly first-party and static, but BaseLayout still emits inline JSON-LD plus a small boot script. Per-request nonces would drift against prerendered output, so the repo uses hash-based CSP derived from the final HTML body.

Current enforced directives:

- `default-src 'self'`
- `base-uri 'self'`
- `connect-src 'self'`
- `font-src 'self'`
- `form-action 'self'`
- `frame-ancestors 'none'`
- `img-src 'self'`
- `media-src 'self'`
- `object-src 'none'`
- `script-src 'self' 'sha256-...' ...`
- `script-src-attr 'none'`
- `style-src 'self'`
- `style-src-attr 'none'`
- `upgrade-insecure-requests` on secure transport only

## Why this shape fits the repo

- No third-party runtime origins exist, so `default-src 'self'` and same-origin subresource directives are viable.
- Motion-order inline styles were removed from Astro components so `style-src-attr 'none'` can be enforced without exceptions.
- Inline JSON-LD now goes through `serializeJsonForScript(...)` in `BaseLayout.astro`, which escapes `<` before insertion and reduces script-breakout risk in future content edits.
- CSP hashes are extracted from the actual response body during request handling, so the policy stays aligned with build output instead of duplicating the inline-script list by hand.
- Astro's framework-level `checkOrigin` remains disabled because it rejects valid local/preview form posts in this standalone runtime. Same-origin POST enforcement therefore lives in the site-owned request guards for `/api/enquiry/`, `/api/analytics/`, and `/api/analytics-preference/`.

## Cache interaction

- HTML retains the launch browser-revalidation policy from the performance layer.
- API routes are forced to `Cache-Control: no-store`.
- Security headers are layered in middleware after route rendering so the cache/security contract stays centralized.

## Rollout note for Prompt 48

- Keep the current middleware enforcement as the runtime source of truth unless deployment moves header control to a CDN/reverse proxy.
- If Prompt 48 migrates headers to the host layer, it must preserve route-accurate CSP hashing or introduce an equivalent build-time hash manifest. Do not replace this with a guessed static CSP string.
