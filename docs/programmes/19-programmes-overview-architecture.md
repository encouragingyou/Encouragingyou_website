# Prompt 19 - Programmes Overview Architecture

## Route Purpose

`/programmes/` is now the support-intent entry point.
It is no longer a lightly restyled duplicate of `/sessions/`.

The production route lives at:

- `site/src/pages/programmes/index.astro`

Its canonical model is built by:

- `site/src/lib/content/site-content.ts#getProgrammesIndexModel`

## Composition Order

The route now renders five deliberate surfaces:

1. `PageIntro`
   - explains the programme-led support model
   - carries the primary actions into `Sessions` and `Contact`
2. comparison panels
   - clarifies the difference between `Programmes`, `Sessions`, and `Contact`
3. four programme-pillar cards
   - compare audiences, gains, delivery state, trust cues, and next-step actions
4. live support bridge
   - shows the currently published recurring sessions without pretending all pillars are timetable-led
5. audience-routing and CTA close
   - supports intent-based wayfinding for people who do not know programme names yet

## Navigation Impact

No shell restructuring was required.
The existing primary navigation already exposes `Programmes`, `Sessions`, and `Contact` clearly enough.

Prompt 19 keeps the shell stable and instead strengthens cross-linking:

- homepage programme teasers continue to link into the programme family
- programme overview explicitly bridges into sessions where live delivery exists
- detail pages retain `Programmes` as the parent breadcrumb

## State Honesty

The overview route now surfaces uneven launch maturity directly on the cards:

- `Live Saturday route`
- `Programme overview`
- `Enquiry-led route`

This prevents two common failures:

- treating programme meaning as if it were just a session grid
- implying every pillar has an equally live schedule when that is not true

## QA Surface

The route is now covered by:

- `site/tests/programmes-page.test.mjs`
- `site/tests/e2e/contracts/programme-overview.spec.mjs`
- updated structural/media route contracts under `site/tests/e2e/**`
