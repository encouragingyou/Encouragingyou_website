# Prompt 48 - Environment Topology And Release Architecture

## Deployment model

The launch runtime is a single Render web service defined in `render.yaml`, backed by the Astro standalone server built from `site/`.

The environment model is:

- `local`: developer workstation, full build and browser validation, indexable by default so local discovery artifacts stay stable in CI.
- `preview`: Render pull-request preview instance created manually for review. The app detects this from `IS_PULL_REQUEST=true`.
- `production`: the long-lived Render service reached through the public domain configured outside source control.
- `release-candidate`: an immutable packaged bundle produced by GitHub Actions after `Site Quality` passes on `main`.

There is no separate long-lived staging service in this prompt. The risk-reduction layer is: validated PR preview when needed, validated `main`, packaged release candidate, manual production promotion, then post-deploy verification.

## Environment boundaries

What changes by environment:

- public origin and canonical URL resolution
- indexability and robots behavior
- analytics collection mode
- writable storage location for enquiries and aggregate analytics
- visible build metadata and deployment headers

What stays immutable across environments:

- application code and structured content in the promoted commit
- CSP, same-origin request guards, and trust/legal route structure
- the generated asset, sitemap, social-preview, and session-calendar pipelines
- the repo-owned post-deploy verification contract

## Preview-safe runtime rules

Previews are review-only surfaces, not soft production.

Preview behavior is enforced in code:

- canonical URLs prefer `RENDER_EXTERNAL_URL` when `SITE_URL` is unset
- HTML responses emit `X-Robots-Tag: noindex, nofollow, noarchive`
- generated `robots.txt` becomes `Disallow: /`
- generated `sitemap.xml` becomes empty
- visible release metadata is shown in the shell banner
- analytics is forced fully `off`
- enquiry and analytics storage is forced to temp storage, even if the base service has production disk paths configured

This means a copied production env var set on a Render PR preview does not silently reactivate indexing, analytics, or live storage writes.

## Runtime architecture

The deploy target remains the Astro standalone server:

- build command: `cd site && npm ci && npm run build`
- start command: `cd site && node ./dist/server/entry.mjs`
- health endpoint: `/api/health/`

`render.yaml` intentionally does not set `DEPLOYMENT_CHANNEL`. Production is inferred from `RENDER=true`. PR previews are inferred from `IS_PULL_REQUEST=true`. That avoids a copied production env var from misclassifying a preview instance.

## State model

Release states for operations:

1. Candidate built: `Site Release Candidate` packages the validated commit from `main`.
2. Candidate validated: `Site Quality` and the packaged manifest/checksums both exist.
3. Awaiting approval: the SHA is eligible for manual production promotion.
4. Deployed: Render has accepted the deploy hook for that SHA.
5. Verified: `verify-deployment.mjs` confirms the live site is serving the expected commit and policy set.
6. Blocked: deploy or post-deploy verification fails.
7. Rolled back: Render is moved back to a previous successful deploy or specific validated SHA.

## Platform choice rationale

Render was selected because the repo now needs:

- a native Node web-service runtime for Astro standalone output
- PR preview support
- deploy hooks for manual promotion
- rollback support tied to retained build artifacts
- a simple persistent-disk option for the current file-backed enquiry and analytics stores

The persistent disk is an explicit tradeoff. It preserves file-backed runtime data, but Render documents that attached disks disable zero-downtime deploys and are not rolled back with a deploy rollback. That is acceptable for launch because the app currently has no managed datastore layer, and the operational docs below treat the disk as durable state that must be managed separately.
