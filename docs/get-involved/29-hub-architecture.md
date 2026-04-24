# Prompt 29 - Get Involved Hub Architecture

Prompt 29 rebuilds `/get-involved/` as a decision hub instead of a generic support-us page.

## Architecture decision

- Keep one operational hub at `/get-involved/` for participation, volunteering, partnership, referral, and wider practical support.
- Derive pathway honesty from shared domain state rather than hardcoded route copy.
- Keep live-session detail on `/sessions/` and public opportunity context on `/events-updates/`.
- Let the hub orchestrate those routes without duplicating either family.

## Runtime composition

The hub now depends on:

- `site/src/content/involvementRoutes/default.json` for canonical pathway definitions
- `site/src/content/routePages/default.json` for hero, ordering, process, spotlight, FAQ, and CTA composition
- `site/src/lib/domain/involvement-hub-state.js` for live-route and opportunity-quiet state derivation
- `site/src/lib/content/site-content.ts` for model assembly, spotlight selection, and structured data
- `site/src/pages/get-involved/index.astro` for route composition

## Page structure

The route now renders in this order:

1. Hero with immediate CTAs and supporting orientation copy
2. Featured live route for `Join a session`
3. Secondary pathway grid for `Volunteer`, `Partner`, `Refer someone`, and wider `Support`
4. Process section with fairness/privacy boundary note
5. Opportunity spotlight surface backed by the editorial feed
6. FAQ and governed contact form
7. Final CTA band

## Reusable involvement family

Prompt 29 adds these reusable surfaces:

- `InvolvementPathwayCard.astro`
- `InvolvementProcessList.astro`
- `InvolvementOpportunitySurface.astro`

These components are intentionally route-family primitives so later volunteer and partner work can reuse the same pathway/status language rather than re-solving hub logic in page-local markup.
