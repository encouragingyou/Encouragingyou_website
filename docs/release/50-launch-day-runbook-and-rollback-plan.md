# Prompt 50 - Launch-Day Runbook and Rollback Plan

## Launch-Day Rule

Do not use this runbook to force a launch past open blockers. It starts only after the state has moved to `ready-for-go-live`.

## Pre-Launch Checklist

1. Confirm the intended release commit on `main`.
2. Confirm the four blocker closures recorded in:
   - `docs/content-launch/49-launch-copy-gaps-and-blocker-log.md`
   - `docs/release/50-defect-severity-and-resolution-log.md`
   - `docs/release/50-monitoring-ownership-and-support-handover.md`
3. From `site/`, run:
   - `npm run ci --workspaces=false`
   - `npm run audit:policy --workspaces=false`
   - `npm run release:package --workspaces=false`
4. Confirm the release package exists in `site/output/releases/`.
5. Confirm production configuration exists outside the repo:
   - `PRODUCTION_SITE_URL`
   - `RENDER_DEPLOY_HOOK_URL`
   - Render service `SITE_URL`
   - writable persistent disk mounted at `/var/data`
6. Confirm the named launch-day owners are filled into the handover table.

## Dry-Run Verification Before Promotion

Use the built artifact locally or on preview before touching production:

1. Start preview from `site/`:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

2. In a second shell, verify the build:

```bash
node ./scripts/verify-deployment.mjs --base-url http://127.0.0.1:4173 --channel local --attempts 10 --waitMs 1000
```

This checks:

- `/api/health/`
- release headers
- homepage, contact, privacy, and cookies route integrity
- robots and sitemap behavior for the current channel

## Production Promotion

Use `.github/workflows/site-production-promote.yml`.

1. Open the `Site Production Promote` workflow.
2. Supply the validated `release_sha`.
3. Supply `release_id` only if an override is genuinely needed; otherwise let it default to the first 12 characters of the SHA.
4. Let the workflow:
   - assert production secrets and variables
   - call `site/scripts/trigger-render-deploy.mjs`
   - wait for production to serve the intended release
   - run `site/scripts/verify-deployment.mjs` against the live URL

Do not bypass the workflow by pressing deploy manually in Render unless the workflow path itself is broken and the incident owner explicitly authorizes the fallback.

## Manual Smoke Checks Immediately After Promotion

After the workflow succeeds, manually confirm these public paths in a real browser:

1. `/`
2. `/contact/`
3. `/sessions/`
4. `/sessions/cv-support/`
5. `/sessions/youth-club/`
6. `/volunteer/`
7. `/partner/`
8. `/safeguarding/`
9. `/privacy/`
10. `/cookies/`
11. `/accessibility/`

Confirm:

- shell renders normally
- forms load and validate
- safeguarding route is visible
- footer legal routes work
- analytics objection control still works on `/cookies/`
- public email and Instagram links still resolve

## Cache and Asset Notes

- The repo does not define a separate CDN purge step.
- HTML routes intentionally use `public, max-age=0`.
- Static assets are fingerprinted or regenerated during build.
- If an upstream CDN exists outside the repo, purge it only if the live site serves stale HTML or stale hashed assets after promotion.

## Rollback Plan

If a rollback trigger from `docs/release/50-go-no-go-decision-framework.md` fires:

1. Stop treating the release as recoverable-by-observation.
2. Record the failure in the incident log with:
   - time
   - release SHA / release ID
   - failing route or capability
   - whether form handling, legal truth, or safeguarding trust was affected
3. Roll back by one of these approved paths:
   - Render rollback to the last known good deploy
   - rerun the production promote workflow with the previous approved `release_sha`
4. Re-run live verification against the rolled-back deployment.
5. Re-check:
   - `/api/health/`
   - `/contact/`
   - `/safeguarding/`
   - `/privacy/`
   - `/cookies/`
6. Freeze further content or deploy changes until the root cause is documented.

## Important Rollback Caveat

The Render service uses a persistent disk for enquiry and analytics storage.

That means:

- rollback restores application code, not stored runtime data
- zero-downtime deploy assumptions are not safe here
- if a release wrote bad runtime data, rollback alone does not remove that data

Any incident involving stored enquiry or analytics records needs both a code rollback and a manual data review.
