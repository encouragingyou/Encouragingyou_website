# Prompt 54 - Admin Security Defaults and Operational Notes

## Secure defaults now in place

- admin access is closed by default unless a valid invitation or local/CI bootstrap account exists
- passwords are hashed, never encrypted
- MFA is required for all live admin roles
- sessions are opaque and server-managed
- admin responses are `noindex` and `no-store`
- admin writes require same-origin, allowlisted-origin, content-type, body-size, and CSRF checks
- public analytics behavior is skipped on admin routes

## Required runtime configuration

Minimum production-grade admin runtime settings are:

- `ADMIN_ORIGIN_URL`
  canonical admin origin
- `ADMIN_TOTP_ENCRYPTION_KEYS`
  server-only key ring for sealing TOTP secrets
- `ADMIN_STORAGE_DIR`
  server-owned persistent store path

Optional policy tuning:

- `ADMIN_SESSION_IDLE_MINUTES`
- `ADMIN_SESSION_ABSOLUTE_HOURS`
- `ADMIN_PENDING_MFA_MINUTES`
- `ADMIN_INVITATION_EXPIRY_HOURS`
- `ADMIN_LOGIN_LOCKOUT_MINUTES`
- `ADMIN_MAX_FAILED_PASSWORDS`
- `ADMIN_MAX_CONCURRENT_SESSIONS`
- `ADMIN_PASSWORD_MIN_LENGTH`
- `ADMIN_RECENT_AUTH_MINUTES`
- `ADMIN_ADDITIONAL_ALLOWED_ORIGINS`

## Local development

- local and CI can enable bootstrap accounts with `ADMIN_ENABLE_DEV_BOOTSTRAP=true`
- if no key ring is configured in `local` or `ci`, the runtime derives a local fallback key automatically
- preview and production must not rely on bootstrap accounts or derived fallback keys

## Storage note

The admin store currently uses JSON files under `ADMIN_STORAGE_DIR`.

That is acceptable only under these assumptions:

- one active writer deployment
- persistent disk or equivalent server-owned storage
- clear backup and restore handling
- no horizontal scaling without replacing or coordinating the store

Prompt 55 must preserve that deployment discipline or upgrade the persistence layer as part of admin deployment isolation.

## Emergency actions

- suspend an account to cut off future access and revoke active sessions
- issue a reset link when password or MFA recovery is needed
- rotate the TOTP encryption key ring by adding a new active key and keeping old decrypt keys until all dependent secrets are replaced
- review the security page audit feed before and after access-management changes

## Deliberate non-features

- no self-registration
- no password recovery by email-only challenge
- no browser-stored primary auth token
- no public-site cookie sharing
- no wildcard origin exceptions
- no undocumented support account

## Prompt 55 dependency

Prompt 55 must take this authenticated admin runtime and place it behind:

- a separate secure admin domain
- isolated deployment workflows and secrets
- deployment and rollback validation
- environment-specific health checks
- public/admin trust separation that is operational, not just architectural
