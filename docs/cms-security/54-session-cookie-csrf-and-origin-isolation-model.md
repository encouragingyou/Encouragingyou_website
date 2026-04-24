# Prompt 54 - Session, Cookie, CSRF, and Origin Isolation Model

## Session architecture

The admin portal uses server-managed opaque sessions rather than browser-stored bearer tokens.

Two session kinds exist:

- `pending-mfa`
  created after password verification and used only to bridge into MFA
- `active`
  created only after successful MFA and used for authenticated admin requests

Both session kinds are persisted server-side and identified in storage by a SHA-256 hash of the raw token, not the token itself.

## Cookie model

Admin cookies are host-scoped and deliberately isolated from the public site.

- `HttpOnly`
- `SameSite=Strict`
- `Secure` when the request is over secure transport
- `Path=/`
- no broad parent-domain sharing
- `__Host-` prefix applied automatically when secure transport allows it

The current cookie names are derived from:

- `ey-admin-session`
- `ey-admin-mfa`

## Expiry and rotation

The auth policy defaults are:

- idle expiry:
  `30` minutes
- absolute session lifetime:
  `8` hours
- pending MFA lifetime:
  `10` minutes
- maximum concurrent active sessions per account:
  `5`

Idle expiry is refreshed on valid activity. Absolute expiry is fixed from session creation. If either threshold is exceeded, the session is revoked server-side and the user must sign in again.

## CSRF and request protection

Admin write endpoints are protected by layered checks:

- same-origin request validation
- admin-origin allowlist validation
- content-type allowlists
- request-size limits
- per-session CSRF token verification
- server-side capability checks

The CSRF token is stored server-side with the active session and mirrored into the admin HTML shell as a meta tag or hidden form value. Sensitive API routes reject missing or mismatched CSRF tokens.

## Origin handling

The admin runtime is modeled as a separate origin concern even though Prompt 54 still lives in the shared Astro project.

- canonical admin origin:
  `ADMIN_ORIGIN_URL`
- additional allowed origins:
  `ADMIN_ADDITIONAL_ALLOWED_ORIGINS`
- local and CI loopback origins are allowed explicitly for development and Playwright

This avoids permissive parent-domain cookie sharing and keeps the portal ready for Prompt 55's dedicated admin domain.

## Logout and revocation

- logging out revokes the current server-side session and clears cookies
- maintainers can revoke access by suspending an account
- account suspension revokes all active sessions immediately
- users can revoke other sessions from the security page
- password reset revokes existing sessions for the target account

## Boundary summary

- no `localStorage` bearer token
- no public-site cookie reuse
- no wildcard cross-origin allowance
- no silent session survival after suspension or reset

The admin session boundary is now materially stronger than the earlier placeholder role model and is ready for deployment isolation in Prompt 55.
