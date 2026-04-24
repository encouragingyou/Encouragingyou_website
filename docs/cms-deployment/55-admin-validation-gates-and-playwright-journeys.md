# Prompt 55 - Admin Validation Gates And Playwright Journeys

## Validation split

The repo now validates the admin portal as its own deployment surface instead of treating admin checks as incidental public-site coverage.

## Public versus admin pipelines

[site/package.json](/Users/test/Code/new_website/site/package.json:1) now exposes:

- `ci:public`
- `ci:admin`
- `validate:admin`
- `test:e2e:public`
- `test:e2e:admin`
- `admin:surface:validate`

The public path excludes admin-only browser tests. The admin path includes only admin-surface journeys plus the admin-surface deployment verification.

## Admin validation stages

`validate:admin` performs:

1. CMS artifact generation
2. formatting and lint checks
3. `astro check`
4. unit tests
5. CMS scope validation
6. production build
7. isolated admin-surface verification

The isolated verification stage lives in [site/scripts/validate-admin-surface.mjs](/Users/test/Code/new_website/site/scripts/validate-admin-surface.mjs:1).

## Surface verification

`admin:surface:validate` starts a built preview with:

- `DEPLOYMENT_SURFACE=admin`
- `ADMIN_PORTAL_ENABLED=true`
- `ADMIN_ENABLE_DEV_BOOTSTRAP=true`
- `ADMIN_ORIGIN_URL=http://127.0.0.1:<port>`
- `ADMIN_STORAGE_DIR=./output/admin-surface/admin`
- `ANALYTICS_MODE=off`

It then runs [site/scripts/verify-deployment.mjs](/Users/test/Code/new_website/site/scripts/verify-deployment.mjs:1) with `--surface admin`.

That script verifies:

- the health endpoint reports `surface=admin`
- root resolves to `/admin/login/`
- public routes like `/contact/` are `404`
- admin responses carry deployment headers
- admin responses emit `noindex`
- admin `robots.txt` disallows all crawling
- admin `sitemap.xml` is empty
- admin crypto readiness is `true`
- admin route exposure is enabled while public route exposure is disabled

## Playwright admin journeys

The dedicated admin browser coverage is in [site/tests/e2e/contracts/admin-surface.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/contracts/admin-surface.spec.mjs:1).

It covers:

- root-to-login isolation and public-route blocking
- editor denial when attempting publisher-only review access
- mobile and keyboard-safe publisher flow through request review, approve, publish, and revert

The suite uses the local bootstrap accounts defined in the admin runtime and the shared helper in [site/tests/e2e/support/admin.mjs](/Users/test/Code/new_website/site/tests/e2e/support/admin.mjs:1).

## Deployment runtime coverage

[site/tests/e2e/contracts/deployment-runtime.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/contracts/deployment-runtime.spec.mjs:1) now asserts surface-specific runtime metadata for:

- `shared`
- `public`
- `admin`

That prevents a future regression where the admin host silently exposes public pages or the public host silently re-enables admin routes.

## GitHub integration

The GitHub workflow boundary now matches the runtime boundary:

- `Site Quality` runs `npm run ci:public`
- `Admin Quality` runs `npm run ci:admin`

On failure, both upload Playwright artifacts for `14` days.

## Promotion gating rule

Admin production promotion is not considered valid unless all of these have already passed on the target SHA:

- `Admin Quality`
- `Admin Release Candidate`
- admin-surface deploy verification

That makes admin promotion a validated release flow, not a best-effort deploy.
