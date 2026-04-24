# About Content Contract

The canonical About-route source now lives in `site/src/content/routePages/default.json` under the `about` page entry.

## Top-level fields

- `intro`
  - hero eyebrow, title, summary, badges, media, and optional action references
- `storySections`
  - ordered narrative blocks for origin, leadership, approach, and wider-community framing
- `purposeSection`
  - route-owned framing plus canonical mission/vision labels and drive copy
- `valuesSection`
  - heading plus icon-backed value rows
- `audienceSection`
  - audience groups with optional cross-route actions
- `trustSection`
  - trust-signal IDs for reusable credibility cards
- `proofBoundary`
  - explicit publish-now / awaiting / withheld lists
- `ctaBand`
  - final next-step block with actions and optional supporting note

## Story-section shape

Each `storySections[]` item can now provide:

- `id`
- `eyebrow`
- `title`
- optional `summary`
- `paragraphs[]`
- optional `bullets[]`
- optional `badges[]`
- optional `quote`
- optional `mediaId`
- optional `note`
- optional `actionReferences[]`
- optional `reversed`

This is the reusable route-story slot introduced by Prompt 18. It is intentionally broad enough to support future origin-story or organisational-story surfaces without switching back to hardcoded prose blocks.

## Mission and vision rule

The About page does not own duplicate mission or vision statements.

`purposeSection` stores:

- section eyebrow/title/summary
- `missionLabel`
- `visionLabel`
- `driveLabel`
- `driveSummary`
- optional `driveBullets[]`

`getAboutPageModel()` then hydrates `missionSummary` and `visionSummary` from `site/src/content/siteSettings/default.json`.

## Proof-boundary rule

`proofBoundary` is a first-class route surface, not a hidden editorial note.

It carries:

- `publishNow[]`
- `awaitingConfirmation[]`
- `withheldUntilVerified[]`

That data is rendered directly on the route and validated in `site/scripts/validate-structured-content.mjs`.

## Validation

Prompt 18 extends structured-content validation so About now fails fast when:

- a story section references missing media
- a story/audience/CTA action points at an unknown route
- a value row references an unknown icon asset
- the page is missing its purpose, values, audience, proof-boundary, or CTA sections
