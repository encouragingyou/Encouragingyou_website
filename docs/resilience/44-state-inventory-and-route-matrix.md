# Prompt 44 - State Inventory And Route Matrix

## Objective

Prompt 44 turns resilience into a first-class product surface. The launch site now treats wrong turns, empty valid states, partial public data, client-side submission failure, absent optional enhancements, and media fallbacks as governed behavior rather than route-local improvisation.

## Shared Taxonomy

Canonical source: `site/src/content/resilienceStates/default.json`

Required launch states:

- `idle`
- `loading`
- `success`
- `validation-error`
- `submission-error`
- `empty-valid`
- `partial-content`
- `unavailable-enhancement`
- `missing-route`
- `archived-content`
- `system-fallback`

## Route Matrix

| Route family / surface | Live state | Degraded or empty state | Canonical surface / rule |
|---|---|---|---|
| `/404/` | Helpful recovery route | Missing route from stale or broken URL | `route-missing-recovery` |
| `/events-updates/` feed | Published editorial items render directly | No public items | `events-feed-empty` |
| `/events-updates/` filter | JS filter narrows visible items | Filter result count is zero | `events-filter-empty` |
| `/sessions/` hub | Live cards + calendar-ready routes | Calendar partially or fully unavailable | `sessions-calendar-partial`, `sessions-calendar-unavailable` |
| `/contact/` contact state | Email, form, and route cards | Phone unpublished, venue withheld, map absent | `contact-launch-partial`, `contact-location-withheld` |
| Shared enquiry form | Idle form shell | Validation error, reload-required, context-expired, submission error, rate limit, no-JS reload | `form-*` surfaces |
| `/cookies/` analytics preference | Statistical measurement active or objected | Analytics fully unavailable or switched off | `analytics-disabled` |
| Media components | Compatibility render available | Compatibility render missing | `media-fallback` |

## Dynamic vs Static Rules

- Static routes do not fake loading. They either render complete content immediately or show a truthful empty / partial state.
- Loading is reserved for real client-side actions, currently the secure enquiry form.
- Partial-content states are used only where the site intentionally withholds or has not yet published a detail, such as public phone, exact venue, or map embed.
- Archived-content remains a domain rule for editorial detail routes and is already handled by the editorial lifecycle model from Prompt 28.

## Current Live Surfaces

- Trustworthy 404 recovery with six route exits
- Events & Updates route-level empty-state contract
- Events & Updates filter no-results contract
- Sessions calendar degradation contract
- Contact launch-state and location-withheld contract
- Shared enquiry validation / failure / no-JS / reload-required feedback
- Media compatibility-render fallback component

## Prompt 45 Fixture Targets

Use these as deterministic validation targets:

- `missing-route`: request `/this-route-does-not-exist/`
- `validation-error`: submit `/contact/` form empty with JS enabled
- `submission-error`: abort `POST /api/enquiry/` in Playwright after filling a valid form
- `no-js-form`: run `/contact/` or safeguarding forms with `javaScriptEnabled: false`
- `events-filter-empty`: stub the feed model or test-only fixture so one filter has zero visible results
- `sessions-calendar-unavailable`: fixture one or more session cards with `calendar.status = "disabled"`
- `contact-partial`: default launch content already exercises this state
- `media-fallback`: fixture a component with a media asset whose compatibility render list is empty
