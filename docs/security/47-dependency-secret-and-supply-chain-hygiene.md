# Prompt 47 - Dependency, Secret, And Supply Chain Hygiene

## Live package surface

The production app dependency surface is `site/package.json`. The legacy `source/blurpint/package.json` remains a static-reference artifact with only image-build and local-serve scripts, so it is not part of the launch runtime trust boundary.

Prompt 47 keeps these controls explicit:

- pinned package manager via `packageManager`
- pinned Node/npm engine ranges
- lockfile-based installs through `npm ci`
- no git/file/http/workspace dependency specs in the live site package
- first-party security validation in `npm run security:validate`
- advisory policy check in `npm run audit:policy`

## Current advisory posture

`npm audit` currently reports only the documented moderate Astro 5 / checker holdovers:

- `GHSA-3rmj-9m5h-8fpv`
- `GHSA-c57f-mm3j-27q9`
- `GHSA-j687-52p2-xcff`
- `GHSA-48c2-rrv3-qjmp`

These are tolerated only because the available remediations require breaking upgrades to Astro 6 / adapter 10 / checker 0.9.2+. `audit:policy` fails on:

- any unexpected vulnerable package
- any unexpected advisory URL
- any high or critical advisory
- any non-registry dependency source in the live package manifest

## Secret rules now explicit in repo defaults

- `.env.example` and `.env.preview.example` are server-side templates, not browser config files
- public-site secrets must not use `PUBLIC_` prefixes
- enquiry, analytics, CMS, inbox, webhook, and deployment tokens must remain server-side only
- no real `.env*` files should be committed
- current live client code does not read browser-exposed secrets

## What Prompt 48 still needs to operationalize

- secret injection in preview/staging/production
- secret rotation ownership
- any future webhook/provider credentials for enquiries or CMS reads
- deployment-time artifact provenance and rollback policy outside the repo-local lockfile/install model
