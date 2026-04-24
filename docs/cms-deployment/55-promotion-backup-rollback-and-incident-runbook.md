# Prompt 55 - Promotion, Backup, Rollback, And Incident Runbook

## Release states

The admin portal now uses the same staged release language as the public site, but on an isolated track:

1. quality passed
2. release candidate packaged
3. production promotion approved
4. Render deploy triggered
5. live surface verified
6. completed, blocked, or rolled back

The public and admin services now move through those states independently.

## Promotion flow

### Public

1. `Site Quality` validates the public surface.
2. `Public Site Release Candidate` packages an immutable public bundle.
3. `Public Site Production Promote` requires `public-production`.
4. The workflow triggers `PUBLIC_RENDER_DEPLOY_HOOK_URL`.
5. `verify-deployment.mjs --surface public` confirms the live public release.

### Admin

1. `Admin Quality` validates the admin surface.
2. `Admin Release Candidate` packages an immutable admin bundle.
3. `Admin Production Promote` requires `admin-production`.
4. The workflow triggers `ADMIN_RENDER_DEPLOY_HOOK_URL`.
5. `verify-deployment.mjs --surface admin` confirms the live admin release.

## Backup discipline

The admin store remains file-backed under `ADMIN_STORAGE_DIR`, which is mounted on the admin Render persistent disk.

That means:

- code rollback and data rollback are separate operations
- admin release safety depends on a disk backup or snapshot discipline
- destructive recovery must target `/var/admin-data/admin`, not the public disk

Before a production admin promote, maintainers should confirm:

- a recent disk snapshot or equivalent backup exists
- the target SHA has a retained admin release artifact
- the previous known-good deploy is still rollback-eligible

## Rollback policy

### Code/config rollback

Use Render rollback on the `encouragingyou-admin` service to return to a recent successful deploy artifact.

### Data rollback

If the incident involves corrupted admin data, a Render rollback is not enough. Persistent disks keep their state across deploys and must be restored separately.

### Auto-deploy safety

Both services use `autoDeployTrigger: off` in [render.yaml](/Users/test/Code/new_website/render.yaml:1). Promotions happen through explicit GitHub workflows and deploy hooks, so rollback is not immediately overwritten by a later automatic push.

## Post-deploy checks

After an admin production promotion, verify:

- `/api/health/` returns `status=ok`
- `deployment.surface === "admin"`
- `surface.publicRoutesEnabled === false`
- `admin.portalEnabled === true`
- `admin.cryptoReady === true`
- `/` redirects to `/admin/login/`
- `/contact/` is `404`
- `robots.txt` disallows all
- `sitemap.xml` is empty
- login page renders and emits `X-Robots-Tag: noindex`

## Incident actions

### Suspected account compromise

- suspend the affected account from the admin security area
- revoke active sessions
- inspect the audit feed for related activity
- require password reset and MFA re-enrolment if needed

### Secret compromise

- rotate `ADMIN_TOTP_ENCRYPTION_KEYS`
- rotate the admin deploy hook
- review `ADMIN_ADDITIONAL_ALLOWED_ORIGINS`
- invalidate active sessions after the rotation window

### Bad deploy

- stop promotion activity
- rollback the Render admin service
- rerun deployment verification against the restored release

### Data corruption

- take the admin service out of use if necessary
- restore the admin disk snapshot or equivalent backup
- verify the public read model and admin audit trail before reopening access

## Known operational constraints

- the admin store is still single-writer
- the admin service should remain single-instance while disk-backed
- activation/reset delivery is still out-of-band, not email-integrated
- GitHub environment protection rules still require repo-admin configuration outside source control

## Go-live standard for the CMS extension

The CMS extension is operationally ready only when all of these are true:

- admin custom domain is configured
- `ADMIN_ORIGIN_URL` matches that domain
- `admin-production` reviewers and no-bypass rules are configured
- a repeatable backup/snapshot procedure exists for the admin disk
- the admin promotion workflow and live verification have been rehearsed once end to end
