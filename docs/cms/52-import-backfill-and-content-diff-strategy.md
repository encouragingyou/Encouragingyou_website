# Prompt 52 - Import, Backfill, and Content Diff Strategy

## Outcome

Prompt 52 seeds the CMS from the already-validated launch site rather than asking editors to re-enter content manually.

The implemented pipeline is:

1. read the current public collections
2. convert them into durable CMS documents
3. wrap each document in a published revision
4. rebuild a public read model from those revisions
5. diff the rebuilt read model against the original public collections

The key artifacts are:

- `site/src/data/generated/cms-write-model-seed.json`
- `site/src/data/generated/cms-public-read-model.json`
- `site/src/data/generated/cms-migration-diff-report.json`

## Seed Model

The seed import currently creates:

- one document per singleton content source
- one document per page/item/group/slug where the source collection is repeatable
- one published revision per document

This gives Prompt 53 a durable base for:

- draft creation
- revision comparison
- rollback
- approval workflow

without breaking the live site first.

## Stable Identifier Rules

The import preserves:

- page ids
- programme slugs
- session slugs
- update item ids
- FAQ group ids
- form surface ids
- media asset ids
- SEO page ids

These identifiers are reused as `recordKey` values in the CMS write model.

## Backfill Principle

Backfill is lossless by default.

The seed preserves the public payload shape so that:

- the published read model can reconstruct the exact same public collections
- no migration step has to guess at route behavior
- editorial UI can evolve later without changing the public contract

## Diff Strategy

The diff strategy is structural and deterministic.

`cms-migration-diff-report.json` records:

- per-collection source fingerprint
- per-collection published fingerprint
- whether they match
- a top-level `allCollectionsMatchSource` result

Prompt 52 treats a mismatch as a contract failure, not as a warning.

## Current Operational Decision

The seed is currently file-backed and generated at build/validation time. That is intentional.

It keeps the repo honest while the future admin portal is still unbuilt:

- the write model already exists
- the public snapshot already exists
- the diff gate already exists
- the admin runtime can be added later without rewriting the public site again
