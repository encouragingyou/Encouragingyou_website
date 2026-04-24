# Prompt 54 - Authorization, MFA, Recovery, and Audit Policy

## Role enforcement

The portal now enforces the Prompt 51 role model at the server boundary rather than only in UI visibility rules.

Role definitions come from `site/src/content/cmsScope/default.json` and are enforced through `adminCan(...)` plus API-level checks.

## Capability map

- `client-editor`
  can create drafts, edit client-owned fields, request review, and view diffs
- `publisher`
  can do editor actions plus approve, publish, revert, archive, edit operator-owned fields, and view the audit log
- `technical-maintainer`
  can do publisher actions plus manage editor access, schema/mappings, runtime concerns, and emergency recovery

## Server-enforced boundaries

Current server enforcement is active on:

- `/api/admin/workflow/`
  for save-draft, request-review, approve, publish, and revert actions
- `/api/admin/access/`
  for session revocation, invitations, suspend/resume, and reset-link issuance

Hidden buttons are not treated as authorization. Requests are rejected server-side when the authenticated role lacks the required capability.

## MFA policy

All live admin roles require TOTP MFA.

- password verification alone never creates an authenticated session
- activation requires successful TOTP enrollment
- login completes only after valid TOTP or recovery-code verification
- maintainer access-management actions require a fresh step-up TOTP code

That step-up requirement applies to invitation issuance, suspension, resume, and password reset link creation.

## Recovery and reset policy

- recovery codes are generated once at activation time
- only hashes of recovery codes are persisted
- using a recovery code marks it as consumed
- password reset is invitation-based and time-limited
- resetting a password revokes the account's active sessions

There is no hidden support bypass and no backdoor "set password without MFA" route.

## Abuse defense

Current abuse defenses are deliberately simple and server-owned:

- per-account failed-password counting
- timed lockout after repeated failures
- invitation expiry
- pending-MFA expiry
- concurrent-session limit
- suspicious login, MFA, and access-management events written to the audit log

This is appropriate for the current single-deployment runtime. Prompt 55 can add deployment-level rate limiting or edge controls around the same contract.

## Audit trail

Security-sensitive and editorially sensitive actions append server-side audit events, including:

- failed login
- lockout-triggering failures
- password verification
- MFA failure
- successful login
- logout
- invitation issuance
- password reset issuance
- account activation
- password reset completion
- session revocation
- account suspension and resume
- workflow actions

The audit log is chained with `previousHash` and `hash`, giving maintainers and publishers a tamper-evident trail for security review and editorial accountability.

## Current limitation

Document draft autosave still uses local browser state as an editing convenience. That does not weaken authorization, because publication and access actions now require authenticated server calls and are audited centrally.
