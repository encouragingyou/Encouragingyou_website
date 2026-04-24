# Prompt 44 - External Dependency And Degradation Plan

## Principle

Optional integrations and enhancements must degrade without breaking the core support journey.

## Dependency Inventory

### Secure enquiry submission

- Dependency: `POST /api/enquiry/`
- Happy path: success confirmation with reference id
- Degraded path:
  - validation failure stays local
  - network / storage failure resolves to shared submission-error copy
  - public email fallback remains visible in the panel

### JavaScript enhancement

- Dependency: client boot in `site/src/lib/client/site-behavior.js`
- Happy path: filter controls, form submission, in-view motion
- Degraded path:
  - routes remain readable without JS
  - form reload fallback remains valid
  - filter controls degrade to static feed visibility

### Anonymous analytics

- Dependency: first-party aggregate analytics runtime
- Happy path: measurement active where allowed
- Degraded path:
  - objection, browser privacy signal, or disabled runtime leaves the site fully usable
  - Cookies route remains the canonical control surface

### Calendar downloads

- Dependency: generated ICS files under `site/public/calendar`
- Happy path: downloadable files match session schedule
- Degraded path:
  - Sessions hub still exposes time/date in cards
  - detail pages and Contact become the recovery path

### Media compatibility renders

- Dependency: generated derivatives in `public/images` and `public/icons`
- Happy path: picture or image render loads normally
- Degraded path:
  - `MediaFallback.astro` renders a neutral placeholder
  - route text and actions remain accessible

### Maps and public directions

- Dependency: approved public directions link or embed
- Happy path: richer location guidance
- Degraded path:
  - launch remains Rochdale-first with venue-on-enquiry handling
  - no map embed is treated as an intentional partial-content state, not an error

## Simulation Guidance

Prompt 45 should simulate:

- aborted `fetch` to `/api/enquiry/`
- `javaScriptEnabled: false`
- missing or disabled calendar feeds
- missing media compatibility render
- analytics objected / disabled state
- not-found route requests
