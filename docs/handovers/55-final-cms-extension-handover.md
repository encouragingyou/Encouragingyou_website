# Prompt 55 Final CMS Extension Handover

Prompt 55 closes the CMS extension by turning the admin portal into a separately deployable and separately governable product.

## Landed in repo

- runtime deployment-surface model in [site/src/lib/deployment/context.js](/Users/test/Code/new_website/site/src/lib/deployment/context.js:1)
- public/admin route isolation in [site/src/middleware.ts](/Users/test/Code/new_website/site/src/middleware.ts:1)
- admin-aware health and readiness reporting in [site/src/pages/api/health.ts](/Users/test/Code/new_website/site/src/pages/api/health.ts:1)
- surface-aware deploy verification in [site/scripts/verify-deployment.mjs](/Users/test/Code/new_website/site/scripts/verify-deployment.mjs:1)
- dedicated admin-surface validation in [site/scripts/validate-admin-surface.mjs](/Users/test/Code/new_website/site/scripts/validate-admin-surface.mjs:1)
- separate Render services in [render.yaml](/Users/test/Code/new_website/render.yaml:1)
- separate public/admin quality, release-candidate, and production-promote workflows under [.github/workflows](/Users/test/Code/new_website/.github/workflows)
- admin-only browser coverage in [site/tests/e2e/contracts/admin-surface.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/contracts/admin-surface.spec.mjs:1)

## Effective operating model

- the public site deploys on the `public` surface
- the admin portal deploys on the `admin` surface
- local and broad CI can still use `shared`
- production promotion is manual and surface-specific
- admin responses are non-indexable and non-cacheable
- admin cookies stay host-scoped and `SameSite=Strict`
- public deployments do not expose admin routes
- admin deployments do not expose public page families

## Required external follow-through

These controls are designed in repo but still need a GitHub or hosting admin to apply them:

- configure GitHub environments `public-production` and `admin-production`
- add required reviewers and disable bypass on both environments
- enforce branch/ruleset protections on `main`
- set the final admin custom domain and `ADMIN_ORIGIN_URL`
- keep admin runtime secrets only on the admin Render service
- maintain disk snapshot/backup discipline for `/var/admin-data/admin`

## Remaining constraints

- admin persistence is still file-backed and single-writer
- no email-based activation/reset delivery exists yet
- Render disk restore remains a separate operation from service rollback

## Final status

The CMS extension is now code-complete through Prompt 55. The remaining work is operational configuration, not another application-layer prompt.
