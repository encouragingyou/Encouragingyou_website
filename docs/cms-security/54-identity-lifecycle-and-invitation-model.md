# Prompt 54 - Identity Lifecycle and Invitation Model

## Decision

The admin portal uses invitation-only local accounts rather than open registration or a third-party identity provider. That is the lowest-complexity option that still gives the team strong server-side control over roles, MFA, suspension, resets, and auditability.

The implemented identity surface lives in:

- `site/src/lib/cms/admin-auth.js`
- `site/src/lib/cms/admin-store.js`
- `site/src/pages/admin/login/`
- `site/src/pages/admin/login/mfa/`
- `site/src/pages/admin/activate/[invitationToken]/`
- `site/src/pages/admin/security/`

## Account lifecycle

1. A maintainer issues an invitation from `/admin/security/`.
2. The system creates a one-time invitation token, stores only its hash, and returns an activation path for out-of-band delivery.
3. The invited user activates the account by setting a password, enrolling TOTP MFA, and completing the first MFA challenge.
4. The account then moves into normal server-managed session use.
5. Maintainers can suspend or resume accounts, and suspension revokes active sessions immediately.
6. Password resets are also invitation-based. The reset flow creates a one-time reset link instead of exposing direct password editing in the admin UI.
7. Offboarding is a suspend-plus-session-revocation operation first, followed by later record cleanup if policy allows it.

## Why local accounts were chosen

- The organisation is small enough that a separate IdP or SSO estate would add more operational weight than security value.
- The admin runtime already owns the CMS role model, so local identities can be mapped directly onto `client-editor`, `publisher`, and `technical-maintainer`.
- Invitation-only activation keeps access closed by default without requiring external identity contracts that the team does not yet operate.

## Bootstrap accounts

Local and CI environments can seed fixture accounts when `ADMIN_ENABLE_DEV_BOOTSTRAP=true`. This is intentionally gated to `local` and `ci` deployment channels only.

- Bootstrap users are never the production account model.
- Bootstrap passwords, TOTP secrets, and recovery codes exist only to support development, CI, and browser tests.
- Production and preview-grade admin environments must use real invitation issuance plus a configured encryption key ring.

## State model

Account and invitation records are stored in the server-owned admin store and carry explicit lifecycle fields:

- Accounts:
  `state`, `createdAt`, `activatedAt`, `suspendedAt`, `lastLoginAt`, `failedPasswordCount`, `lockoutUntil`
- Invitations:
  `purpose`, `issuedAt`, `expiresAt`, `consumedAt`, `issuedByAccountId`

The current implementation is file-backed JSON under `ADMIN_STORAGE_DIR`, which is acceptable for a single-writer admin deployment with persistent disk. Prompt 55 must preserve that single-instance assumption or replace the storage layer before horizontal scaling.

## Operational boundary

- There is no self-registration.
- There is no shared public-site login.
- There is no role assignment via client-side state.
- Invitation links are one-time bootstrap artifacts and must be delivered out of band.
- Prompt 55 must put this same lifecycle behind a dedicated admin domain and deployment pipeline rather than relying on the co-hosted route family alone.
