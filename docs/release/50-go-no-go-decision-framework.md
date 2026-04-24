# Prompt 50 - Go / No-Go Decision Framework

## Current State

As of 2026-04-24, the site is in `ready-pending-approval`.

That means:

- the release candidate build is technically green
- the deployment, packaging, and rollback paths exist
- launch should still not happen until the explicit blocker decisions are closed

## State Machine

| State                        | Meaning                                                                                           | Entry conditions                                                                                                                                                   | Exit conditions                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `not-ready`                  | Release candidate is not safe to promote.                                                         | Broken CI, broken launch-critical route, failed legal/security check, or unresolved blocker with no mitigation.                                                    | Move to `ready-pending-approval` only after defects are fixed and validation is rerun.                                            |
| `ready-pending-approval`     | Technical release candidate is solid, but a person still needs to approve open go-live decisions. | Current state on 2026-04-24. CI, packaging, local verification, and policy checks pass, but launch approvals are still open.                                       | Move to `ready-for-go-live` when all blockers are explicitly closed.                                                              |
| `ready-for-go-live`          | The team can promote the approved commit to production.                                           | Latest approved commit passes `ci`, `audit:policy`, `release:package`, and deployment verification; blocker decisions are signed off; launch-day owners are named. | Move to `live-with-heightened-watch` after production promotion succeeds.                                                         |
| `live-with-heightened-watch` | Production is live and under active observation.                                                  | Production promote workflow succeeds and the live site passes post-deploy verification and smoke checks.                                                           | Move to `rolled-back` if a rollback trigger fires; otherwise drop to normal maintenance after the heightened-watch window closes. |
| `rolled-back`                | Production is reverted to the last known good release or previous approved commit.                | Release verification fails after deployment or a rollback trigger fires.                                                                                           | Move back to `ready-pending-approval` only after root cause is documented and a new validated candidate exists.                   |

## Conditions To Reach `ready-for-go-live`

All of the following must be true on the same approved release candidate:

1. `npm run ci --workspaces=false`
2. `npm run audit:policy --workspaces=false`
3. `npm run release:package --workspaces=false`
4. local or preview `verify-deployment` passes against the built artifact
5. an owner signs off one of these outcomes for each open content blocker:
   - launch without a phone number
   - launch with the current role-based safeguarding route, or publish approved replacement wording
   - launch without session price/referral wording, or publish approved wording
6. the launch-day role table in `docs/release/50-monitoring-ownership-and-support-handover.md` is filled with real people or role-owned inboxes

## Rollback Triggers

Rollback is the correct response, not passive observation, if any of the following are true after production promotion:

1. `/api/health/` returns non-200 or reports `status: degraded`.
2. `X-Deployment-Channel`, `X-Release-Id`, or `X-Release-Sha` do not match the intended production release.
3. A valid contact, volunteer, partner, or safeguarding form submission fails on production.
4. The privacy, cookies, contact, or safeguarding routes are unavailable or obviously contradictory to the live system.
5. Production unexpectedly renders preview-only behavior, including `noindex` output or analytics disabled when the production contract says otherwise.
6. Security headers, CSP, or origin/request guard behavior are broken on live HTML or API routes.
7. A release introduces a trust-critical content regression that changes the meaning of contact, safeguarding, or legal statements.

## Observation Triggers That Do Not Automatically Require Rollback

These should create an incident note and active monitoring first:

- short-lived Render cold-start delay with successful recovery
- advisory dependency findings unchanged from the accepted holdover list
- a non-critical content typo that does not change meaning
- missing future-proof assets such as partner logos or photography that were already deferred honestly

## Decision Rule

If the blocker list is open, the correct answer is `no-go`.

If the blocker list is closed and the approved commit passes the verification set above, the correct answer becomes `go`.
