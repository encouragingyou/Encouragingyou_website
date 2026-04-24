# Prompt 48 - CI/CD Gate And Artifact Contract

## Gate sequence

The deployment pipeline is now ordered as explicit gates:

1. `Site Quality`
   - install dependencies
   - run `npm run ci`
   - fail fast on static analysis, unit tests, route validation, performance policy, browser quality gates, and journey coverage
2. `Site Release Candidate`
   - only runs after `Site Quality` succeeds for a push to `main`
   - rebuilds the validated SHA
   - runs `npm run release:package`
   - uploads immutable release artifacts
3. `Site Production Promote`
   - manual `workflow_dispatch`
   - requires an approved SHA
   - triggers the Render deploy hook for that SHA
   - blocks completion until repo-owned post-deploy verification passes

## Immutable release artifact

`npm run release:package` writes:

- `site/output/releases/encouragingyou-site-<releaseId>.tgz`
- `site/output/releases/<releaseId>/release-manifest.json`
- `site/output/releases/<releaseId>/release-checksums.txt`

The bundle contains the built `dist` tree plus checksum metadata. This artifact is the audit package for the validated commit. Render still builds from Git for the live service, but the repo keeps an immutable record of what the validated build produced.

## Workflow responsibilities

`Site Quality`

- protects merge quality and repo health
- remains the only blocking workflow for code validation

`Site Release Candidate`

- packages only a SHA that already passed `Site Quality`
- never deploys
- keeps a retained artifact for release review and rollback reference

`Site Production Promote`

- is the only workflow allowed to move traffic-affecting production state
- depends on GitHub Environment protections on `production`
- uses `PRODUCTION_SITE_URL` and `RENDER_DEPLOY_HOOK_URL` from the protected environment

## Reusable pipeline rules

- `site/` remains the working directory for app commands.
- Release packaging checks out the exact validated `workflow_run.head_sha`.
- Production promotion checks out the exact requested `release_sha`.
- Release identifiers default to the first 12 characters of the promoted SHA.
- Production deploys do not auto-run on merge because Render `autoDeployTrigger` is set to `off`.

## Why promotion is manual

A passing build is not enough to prove a safe public release for this site. Promotion stays manual because launch content, legal/trust wording, and live contact handling still need human approval even when the code passes automated gates.
