# Prompt 27 - Events & Updates Index Architecture

Prompt 27 turns `/events-updates/` into a real editorial index rather than a governed placeholder.

## Architecture decision

- Keep recurring support on `/sessions/`; do not let the updates layer become a second timetable.
- Build the route from structured editorial content, not route-local cards.
- Support a light publishing rhythm through one optional featured item plus a small mixed feed.
- Reuse the same editorial source on the homepage so the site does not fork into two update systems.

## Route composition

The production route now comes from:

- `site/src/content/updatesFeed/default.json` for editorial items, categories, featured/feed labels, and empty-state copy
- `site/src/content/routePages/default.json` for route-level intro, overview, notice, and CTA band copy
- `site/src/lib/domain/editorial-feed.js` for derived state
- `site/src/lib/content/site-content.ts` for route-safe UI models and structured data
- `site/src/pages/events-updates/index.astro` for the final page assembly

The UI contract is:

- intro and orientation band first
- one pinned item when a current featured item exists
- a filterable mixed feed for the remaining public items
- a filter-empty panel that does not replace the route itself
- a route-level empty state only when there are no public editorial items at all

## Shared UI layer

Prompt 27 adds reusable editorial surfaces rather than route-only markup:

- `EditorialCard.astro`
- `EditorialFilterBar.astro`

These are deliberately neutral enough to support future event-detail and update-detail families without rebuilding the index shell first.

## Homepage integration

`HomeUpdatesSurface.astro` now consumes `editorialFeed.homeItems`, so the homepage and `/events-updates/` share one canonical editorial truth with separate density rules.
