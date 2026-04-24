# Prompt 52 - Editorial State Machine, Versioning, and Rollback

## Outcome

The editorial lifecycle is now formalized in `site/src/content/cmsWorkflow/default.json` and runtime helpers in `site/src/lib/cms/state-machine.js`.

This is the contract Prompt 53 must respect when it builds the admin UI.

## States

The CMS lifecycle now includes:

- `draft`
- `under-review`
- `approved`
- `scheduled`
- `published`
- `superseded`
- `archived`

Only `published` is eligible for the public read model.

## Transition Rules

The transition model is intentionally narrow:

- client editors can move `draft -> under-review`
- publishers and technical maintainers can:
  - return review items to draft
  - approve for publication
  - schedule publication
  - publish immediately
  - supersede a published revision
  - archive content
  - roll back by publishing a prior snapshot as a new revision

This preserves separation of duties:

- editors draft
- publishers approve and publish
- maintainers retain emergency and structural authority

## Revision Model

Each CMS document now has:

- `documentId`
- `documentTypeId`
- `recordKey`
- `currentPublishedRevisionId`
- `latestRevisionId`
- `revisions[]`

Each revision stores:

- `revisionId`
- `version`
- `state`
- `createdAt`
- `createdBy`
- `approvedAt`
- `approvedBy`
- `publishedAt`
- `publishedBy`
- `changeSummary`
- `publishNote`
- `contentHash`
- `content`

The current seed baseline uses one imported published revision per document. That is deliberate: Prompt 52 establishes the durable structure first, then Prompt 53 can add draft/review UI on top of it.

## Rollback Model

Rollback is not destructive overwrite.

The rule is:

- a rollback creates a new published revision from a prior published snapshot
- the replaced revision becomes `superseded`
- the revision chain remains traceable

This gives the admin side a clean audit story:

- what changed
- who changed it
- what was published
- what was restored

## Scheduled Publication

The system supports `scheduled` revisions in the lifecycle contract but does not leak them into the public read model.

Scheduled records require:

- `publishAt`
- an approved revision
- a publish note

Prompt 52 does not implement the scheduler runtime. It only formalizes the state and required metadata so Prompt 53 and later admin/runtime work can do so without changing the contract.

## Public Visibility Rule

The workflow hard-codes the trust boundary:

- `draft` is never public
- `under-review` is never public
- `approved` is never public
- `scheduled` is never public
- `superseded` is never public
- `archived` is never public
- `published` is the only public-export state

That rule is enforced both in the workflow config and in validation/tests.
