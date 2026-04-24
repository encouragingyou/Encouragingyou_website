# EncouragingYou Website Workspace

The production application lives in [site/](/Users/test/Code/new_website/site). The legacy prototype used for migration reference lives in `source/blurpint/`. Long-form project and engineering notes live in `docs/`.

## Quick Start

```bash
cd site
npm ci
npm run dev
```

## Main Commands

From `site/`:

```bash
npm run dev
npm run lint
npm run check
npm run test:unit
npm run build
npm run test:e2e
npm run validate
npm run ci
npm run release:package
npm run deploy:verify -- --base-url http://127.0.0.1:4173 --channel local
npm run security:validate
npm run audit:policy
```

## Environment Files

Start from:

- `site/.env.example`
- `site/.env.preview.example`

Do not commit real `.env*` files.
Do not add browser-exposed `PUBLIC_` secrets for this site. Server-side tokens and inbox/webhook credentials stay out of source and out of client bundles.

Render deployment is defined in [render.yaml](/Users/test/Code/new_website/render.yaml). The release workflows are:

- [site-quality.yml](/Users/test/Code/new_website/.github/workflows/site-quality.yml)
- [site-release-candidate.yml](/Users/test/Code/new_website/.github/workflows/site-release-candidate.yml)
- [site-production-promote.yml](/Users/test/Code/new_website/.github/workflows/site-production-promote.yml)

Production promotion is intentionally manual. `Site Quality` validates a commit, `Site Release Candidate` packages an immutable bundle for that validated SHA, and `Site Production Promote` triggers the Render deploy hook for an approved SHA and runs repo-owned post-deploy verification against the live base URL configured in the GitHub `production` environment.

## Primary Docs

- [Workspace Topology](/Users/test/Code/new_website/docs/developer/07-workspace-topology.md)
- [Tooling and Command Surface](/Users/test/Code/new_website/docs/developer/07-tooling-and-command-surface.md)
- [Environment Matrix](/Users/test/Code/new_website/docs/developer/07-environment-matrix.md)
- [CI Quality Gates](/Users/test/Code/new_website/docs/developer/07-ci-quality-gates.md)
- [Deployment Architecture](/Users/test/Code/new_website/docs/deployment/48-environment-topology-and-release-architecture.md)
- [Deployment Gate Contract](/Users/test/Code/new_website/docs/deployment/48-ci-cd-gate-and-artifact-contract.md)
