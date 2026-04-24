# Prompt 13 - Collection Schema Catalog

Prompt 13 adds four new launch collections and formalizes how they sit next to the existing domain collections.

## New collections

- `formSurfaces`
  - Owns reusable form headings and short privacy-facing intro copy.
  - Used by home support, contact, and get-involved.

- `routePages`
  - Owns page-level meta descriptions, intro copy, section headings, placeholder empty states, notices, and page-specific CTA labels for Astro-owned non-detail routes.
  - Covers `about`, `privacy`, `programmes`, `sessions`, `contact`, `get-involved`, `safeguarding`, placeholder routes, and `not-found`.

- `sessionPageContent`
  - Owns session-detail intro copy, action labels, panel headings, FAQ headings, urgent notice titles, and fallback notices.
  - Domain facts still stay in `sessions/*.json`.

- `programmePageContent`
  - Owns programme-detail page composition defaults and page-to-programme bindings.
  - Domain facts still stay in `programmes/*.json`.

## Existing collections now treated as domain inputs

- `programmes`
  - Canonical programme facts, summaries, outcomes, sections, media ids, and related session ids.

- `sessions`
  - Canonical recurring-session facts, scheduling data, contact metadata, FAQ bindings, and media ids.

- `faqs`
  - Reusable FAQ groups referenced by route and session/programme composition.

- `trustSignals`
  - Shared trust-card labels, icons, and summaries.

- `involvementRoutes`
  - Shared volunteer / partner / referral route summaries and trust notes.

- `legalPages`
  - Launch-state legal metadata and blocked-fact tracking for policy routes.

- `homePage`
  - Homepage section order and homepage-specific editorial copy.

## Schema intent

- Collections are editorially legible.
- Page composition data is separated from domain facts.
- Route templates no longer need to know which JSON file contains a given sentence.
