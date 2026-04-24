# Prompt 28 - Event and Update Schema Model

Prompt 28 extends the editorial content contract so events and updates can share one collection without pretending to be the same kind of page.

## Canonical schema changes

`site/src/content/config.ts` now requires each editorial item to carry:

- `slug`
- `detail`
- one lifecycle field appropriate to its type

Detail entries now support:

- `intro`
- optional `secondaryAction`
- typed `sections`
- optional `proofNotice`
- optional `relatedSection`
- optional `relatedItemIds`
- `ctaBand`

The collection also adds `event-detail` and `update-detail` as explicit page-template values.

## Type-specific rules

Events must use `eventLifecycle`, not `updateLifecycle`.

Updates and opportunities must use `updateLifecycle`, not `eventLifecycle`.

Current seeded lifecycle coverage is:

- `date-to-be-confirmed` for the event placeholder that truthfully has no public date yet
- `current` for the route-governance update
- `current` for the open opportunity post

## Derived runtime state

`site/src/lib/domain/editorial-feed.js` now derives:

- `detailHref`
- `detailTemplate`
- `detailVisible`
- `temporalState`
- `lifecycleLabel`
- `featuredEligible`
- `homeVisible`
- `indexVisible`

That keeps visibility, archive handling, and route generation out of ad hoc route files.

## Structured data mapping

`site/src/lib/content/site-content.ts` now emits:

- `Event` structured data only when an event actually has a real `eventDate`
- `Article` structured data for non-event editorial entries

The current seeded event intentionally emits no `Event` schema because the source materials do not justify a fabricated date.

## Validation

`site/scripts/validate-structured-content.mjs` now checks:

- unique editorial slugs
- detail CTA/action references
- detail-note action references
- related item ids
- section media references
- required narrative paragraphs

This keeps the detail family stable without needing route-local fallback logic.
