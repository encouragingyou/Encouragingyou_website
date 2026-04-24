# Prompt 48 - Production Promotion, Rollback, And Cache Strategy

## Production promotion path

Production promotion is:

1. merge approved work to `main`
2. let `Site Quality` pass
3. let `Site Release Candidate` package the validated SHA
4. run `Site Production Promote` with that SHA
5. wait for `verify-deployment.mjs` to confirm the live release

Render production auto-deploy is off. No commit becomes public just because it landed on `main`.

## Rollback model

Two rollback paths are supported:

- Render rollback to a previous successful deploy when the retained build artifact still exists
- Render deploy of a specific previously validated SHA through the same manual promotion flow

Use Render rollback first for the fastest recovery. Use a specific validated SHA when the required target is older than the retained rollback window or when the team needs a known commit-based recovery path.

## Durable state caveat

The production service uses a persistent disk because the current launch architecture stores:

- secure enquiries on disk
- aggregate analytics summaries on disk

This creates an operational constraint:

- Render documents that attached disks disable zero-downtime deploys
- Render also documents that disks are not rolled back with a deploy rollback

Because of that, rollback restores application code and service config, not durable enquiry or analytics files. Treat the disk as separate state. If disk-level recovery is required, use Render disk snapshots, not application rollback.

## Cache strategy

The cache policy stays app-owned in middleware and generated assets:

- HTML remains short-lived and request-validated
- immutable client assets stay fingerprinted
- discovery artifacts are regenerated per build

Render deploys automatically clear stale edge-cached service content after a successful deploy when edge caching is in play. The repo does not maintain a separate manual CDN purge step in this prompt.

## Block conditions

Do not mark a release complete when any of the following happen:

- Render does not report the target SHA on `/api/health/`
- the live site fails route or policy verification
- preview-only directives leak into production
- production unexpectedly serves noindex or empty sitemap output
- a deploy requires urgent rollback because the disk-backed runtime cannot be trusted
