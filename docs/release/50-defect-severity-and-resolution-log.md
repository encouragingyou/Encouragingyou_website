# Prompt 50 - Defect Severity and Resolution Log

## Status Key

| Status               | Meaning                                              |
| -------------------- | ---------------------------------------------------- |
| `resolved`           | Fixed in Prompt 50 and revalidated.                  |
| `open-blocker`       | Still blocks launch.                                 |
| `accepted-follow-up` | Not a launch blocker, but must stay on the register. |

## Defect Log

| ID        | Severity           | Status               | Issue                                                                                                                                             | Evidence / action                                                                                                                                                                                     |
| --------- | ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REL-001` | `critical-fixable` | `resolved`           | Prerendered routes emitted Astro warnings because middleware and shared layout logic read request headers during prerender.                       | Fixed in `site/src/middleware.ts`, `site/src/layouts/BaseLayout.astro`, and `site/src/pages/cookies/index.astro`. Revalidated with `npm run build --workspaces=false`; the warning no longer appears. |
| `REL-002` | `critical-fixable` | `resolved`           | `site/scripts/verify-deployment.mjs` did not accept the `--base-url` flag used by `.github/workflows/site-production-promote.yml`.                | Fixed by accepting both `--baseUrl` and `--base-url`, then revalidated with `node ./scripts/verify-deployment.mjs --base-url http://127.0.0.1:4173 --channel local --attempts 10 --waitMs 1000`.      |
| `REL-003` | `critical-fixable` | `resolved`           | The deployment verifier still asserted stale privacy copy (`Your rights`) instead of the current production wording.                              | Fixed in `site/scripts/verify-deployment.mjs` by checking the live `rights` section and current heading `Your choices and rights`. Local verification now passes.                                     |
| `REL-004` | `blocker`          | `open-blocker`       | No owner decision yet on publishing without a public phone number.                                                                                | Logged in `docs/content-launch/49-launch-copy-gaps-and-blocker-log.md` and `site/src/content/launchGovernance/default.json`.                                                                          |
| `REL-005` | `blocker`          | `open-blocker`       | No owner decision yet on whether the safeguarding route can launch with the role-based inbox only, or whether a named public contact is required. | Logged in `docs/content-launch/49-launch-copy-gaps-and-blocker-log.md` and `site/src/content/launchGovernance/default.json`.                                                                          |
| `REL-006` | `blocker`          | `open-blocker`       | No owner decision yet on whether session price/referral wording can remain omitted at launch.                                                     | Logged in `docs/content-launch/49-launch-copy-gaps-and-blocker-log.md` and `site/src/content/launchGovernance/default.json`.                                                                          |
| `REL-007` | `blocker`          | `open-blocker`       | The repo now defines the launch-day roles, but not the named people who will hold them on go-live day.                                            | Captured in `docs/release/50-monitoring-ownership-and-support-handover.md`. This must be filled before production promotion.                                                                          |
| `REL-008` | `medium`           | `accepted-follow-up` | Seven known moderate dependency findings remain because the available fixes are Astro/checker major-upgrade work, not safe patch-level updates.   | Revalidated with `npm run audit:policy --workspaces=false`. No unexpected dependency sources were found.                                                                                              |
| `REL-009` | `medium`           | `accepted-follow-up` | The site still has no public safeguarding policy download.                                                                                        | Launch-safe because the safeguarding route states this honestly and does not imply a downloadable policy exists.                                                                                      |
| `REL-010` | `medium`           | `accepted-follow-up` | Partner logos, funder proof, testimonials, and case studies are still absent.                                                                     | Launch-safe because the partner route no longer pretends those proof assets exist. Deferred in `site/src/content/launchGovernance/default.json`.                                                      |
| `REL-011` | `medium`           | `accepted-follow-up` | No consented real photography, team bios, or impact-story proof surfaces exist yet.                                                               | Launch-safe because the site explicitly uses AI-generated illustration disclosure and does not imply documentary photography exists.                                                                  |
| `REL-012` | `medium`           | `accepted-follow-up` | The public privacy notice still uses a manual-review retention approach rather than fixed day-counts.                                             | Launch-safe because the notice states the real operational model instead of inventing a false fixed schedule.                                                                                         |
| `REL-013` | `medium`           | `accepted-follow-up` | Automated accessibility smoke is green, but a deeper manual audit is still outstanding.                                                           | Captured as a post-launch quality item, not a blocker against the current release candidate.                                                                                                          |

## Blocker Closure Rule

Launch can move past `ready-pending-approval` only when:

1. `REL-004`, `REL-005`, and `REL-006` are closed by approved content or explicit omission sign-off.
2. `REL-007` is closed by filling actual launch-day names or role-owned inboxes into the runbook.
3. The closing commit still passes the final verification set in `docs/release/50-final-launch-readiness-summary.md`.
