# Prompt 55 - GitHub Environments, Protection Rules, And Secret Model

## Workflow split

The repo now has separate GitHub Actions tracks for public and admin delivery:

### Public

- [site-quality.yml](/Users/test/Code/new_website/.github/workflows/site-quality.yml:1)
- [site-release-candidate.yml](/Users/test/Code/new_website/.github/workflows/site-release-candidate.yml:1)
- [site-production-promote.yml](/Users/test/Code/new_website/.github/workflows/site-production-promote.yml:1)

### Admin

- [admin-quality.yml](/Users/test/Code/new_website/.github/workflows/admin-quality.yml:1)
- [admin-release-candidate.yml](/Users/test/Code/new_website/.github/workflows/admin-release-candidate.yml:1)
- [admin-production-promote.yml](/Users/test/Code/new_website/.github/workflows/admin-production-promote.yml:1)

This is the main GitHub-managed governance boundary. Admin promotion no longer rides on the public release path.

## Concurrency and promotion model

Implemented concurrency groups are:

- `site-quality-${github.ref}`
- `admin-quality-${github.ref}`
- `site-release-candidate-${head_branch || head_sha}`
- `admin-release-candidate-${head_branch || head_sha}`
- `site-production`
- `admin-production`

That gives:

- cancel-in-progress behavior for repeated validation/package runs
- serialized production promotions per surface
- no accidental overlap between public and admin production pushes

## Artifact retention

The repo now uses explicit retention windows:

- failed Playwright artifacts: `14` days
- release candidate bundles: `30` days

Those settings live directly in the workflow files and match the release/rollback intent of this prompt.

## Minimal token permissions

The quality workflows now declare `permissions: { contents: read }` for both blocking and advisory jobs. Release and promote workflows already use read-only contents permissions.

The repo does not grant broad write scopes just to run validation or trigger a Render deploy hook.

## Environment model in GitHub

The repo code now expects these GitHub environments:

- `public-production`
- `admin-production`

Both are referenced directly by the promotion workflows. They must be configured in GitHub repository settings.

## Required GitHub environment settings

These controls cannot be fully enforced from source control and must be configured in GitHub:

### `public-production`

- deployment branches restricted to `main`
- required reviewer enabled
- prevent self-review enabled
- administrator bypass disabled
- environment variable `PUBLIC_SITE_URL`
- environment secret `PUBLIC_RENDER_DEPLOY_HOOK_URL`

### `admin-production`

- deployment branches restricted to `main`
- stricter reviewer policy than public production
- prevent self-review enabled
- administrator bypass disabled
- environment variable `ADMIN_ORIGIN_URL`
- environment secret `ADMIN_RENDER_DEPLOY_HOOK_URL`

For this repo, the admin environment should require at least one technically capable approver who understands MFA, disk-backed admin storage, and admin-domain rollback.

## Required branch and ruleset policy

GitHub rulesets are also an external repository setting, not a repo file. The repo now assumes the following policy on `main`:

- pull request required
- stale approvals dismissed on new commits
- required status checks:
  - `Blocking Quality Gates`
  - `Blocking Admin Quality Gates`
- direct pushes blocked except for approved maintainers under emergency procedure

If these rules are absent, the workflow split still exists, but the governance model is incomplete.

## Secret separation rules

The GitHub environment secrets in this prompt are deploy-transport secrets only:

- public deploy hook stays in `public-production`
- admin deploy hook stays in `admin-production`

Runtime application secrets remain platform-owned on Render and are not reused across surfaces. In particular:

- `ADMIN_TOTP_ENCRYPTION_KEYS` belongs only to the admin service
- `ADMIN_ORIGIN_URL` belongs only to the admin service
- public deploys do not receive admin runtime secrets

## Promotion path

The intended GitHub-managed promotion sequence is:

1. PR or `main` change passes the appropriate quality workflow.
2. Successful `main` push triggers the matching release-candidate workflow.
3. Release bundle artifact is retained with checksums and manifest.
4. Manual production promotion references the validated SHA and the correct GitHub environment.
5. The promote workflow triggers the matching Render deploy hook.
6. [site/scripts/verify-deployment.mjs](/Users/test/Code/new_website/site/scripts/verify-deployment.mjs:1) validates the live surface before the job succeeds.

## Honest operational note

The workflows and environment names are implemented in repo code. The actual reviewer lists, branch restrictions, and no-bypass settings still require a GitHub admin to configure them in repository settings. That is an operational follow-through requirement, not a missing code path.
