# Prompt 28 - Editorial Detail Template Family Architecture

Prompt 28 turns the editorial layer into a real detail-route family rather than a feed with nowhere to go.

## Architecture decision

- Keep one canonical editorial source in `site/src/content/updatesFeed/default.json`.
- Route every public editorial detail page through `/events-updates/[slug]/`.
- Split rendering into two templates:
  - `EventDetailTemplate.astro` for event-shaped entries
  - `EditorialUpdateDetailTemplate.astro` for updates and opportunities
- Reuse shared detail primitives for hero, facts, related items, and CTA handling so the family stays coherent without forcing irrelevant empty panels into every route.

## Runtime composition

The family now depends on:

- `site/src/content/config.ts` for the typed detail schema
- `site/src/lib/domain/editorial-feed.js` for lifecycle, visibility, and detail-route derivation
- `site/src/lib/content/site-content.ts` for detail-model assembly, related-item resolution, and structured data
- `site/src/pages/events-updates/[slug].astro` for static path generation and template dispatch
- `site/src/layouts/BaseLayout.astro` for shell-wayfinding overrides so editorial detail pages can inherit the `Events & Updates` shell while supplying their own breadcrumb trail and back link

## Shared UI contract

Prompt 28 adds these reusable editorial-detail surfaces:

- `EditorialDetailHero.astro`
- `EditorialFactRail.astro`
- `EditorialRelatedSection.astro`

These components are intentionally content-type-neutral. The event template uses them in a more operational sequence, while the update template uses them in a more editorial two-column composition.

## Template split

`EventDetailTemplate.astro` is for occasional public event notices where date, time, location, and current-status trust matter more than long-form narrative density. The template puts:

- the hero first
- lifecycle and proof notices immediately after
- a dedicated practical-facts rail in a banded section
- narrative sections afterwards
- related routes and CTA band last

`EditorialUpdateDetailTemplate.astro` is for updates and opportunity posts where the page should stay readable and light. The template keeps:

- the hero first
- notices and narrative sections in the main reading column
- the fact rail in the aside
- related editorial items and CTA band after the main content

## Result

The editorial index and the editorial detail pages now work as one route family. Cards on the homepage and `/events-updates/` point into the detail routes first, and the detail routes then hand people into the correct practical destination such as `Sessions`, `Get Involved`, or `Contact`.
