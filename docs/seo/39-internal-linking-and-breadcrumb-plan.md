# Prompt 39 - Internal Linking And Breadcrumb Plan

## What changed

The shell now has a third wayfinding layer, in addition to breadcrumbs and back links:

- breadcrumbs for hierarchy
- back links for parent-route recovery
- contextual related-route links for deliberate crawl and user flow reinforcement

The new related-link groups live in `site/src/content/shellConfig/default.json` and render through `site/src/components/site/ShellWayfinding.astro`.

## Linking model

### Global shell links

- Header primary nav keeps the top-level route inventory short.
- Utility nav keeps trust routes visible from every page.
- Footer keeps broad discovery and legal access intact.

### Contextual related links

The new shell groups reinforce the main content graph:

- About → Programmes / Sessions / Contact
- Programmes family → Sessions / Contact / Get Involved
- Career Support programme → CV Support session / Programmes / Contact
- Sessions hub → Programmes / Contact / Get Involved
- CV Support session → Career Support programme / Sessions / Contact
- Youth Club session → Community & Friendship programme / Sessions / Contact
- Events & Updates → Sessions / Get Involved / Contact
- Get Involved hub → Volunteer / Partner / Contact
- Volunteer → Get Involved / Partner / Contact
- Partner → Get Involved / Volunteer / Contact
- Contact → Sessions / Programmes / Safeguarding
- Safeguarding hub → Child route / Adult route / Contact
- Safeguarding detail routes → Safeguarding hub / Contact / Privacy
- Legal routes → Contact / Safeguarding / Home

## Breadcrumb rules

- Production page breadcrumbs still come from the shell parent map.
- Dynamic programme/session details keep explicit parent breadcrumbs from their route model.
- Editorial details keep explicit `Events & Updates` breadcrumbs from their route model.
- Home and 404 remain breadcrumb-hidden.

## Navigation-state rule

- Nested routes under `/programmes/`, `/sessions/`, and `/events-updates/` can use their own canonical path and still keep the parent nav current.
- Flat child routes `/volunteer/` and `/partner/` keep their own canonical URLs, but intentionally pass `currentPath="/get-involved/"` to the shell so the primary nav still reflects the correct parent hub.

This separation is intentional:

- canonical URL answers search engines
- current nav state answers humans

## Anchor-text rule

Prompt 39 avoids repetitive generic anchors such as repeated `Learn more`.

Preferred pattern:

- use the route purpose in the label
- use the parent/child relationship in the label when relevant
- keep action labels specific enough to disambiguate programmes vs sessions vs contact vs safeguarding

Examples now in production:

- `Join the CV support session`
- `See the wider career support route`
- `Visit safeguarding guidance`
- `Raise a child safeguarding concern`

## Prompt 40 dependency

Prompt 40 should treat these shell related-link groups and breadcrumbs as the canonical crawl graph when refining:

- sitemap priority/order
- breadcrumb structured data
- route-level schema relationships
