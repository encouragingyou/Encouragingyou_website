# Prompt 22 - Career Support Route Architecture

## Route Purpose

`/programmes/career-support-cv-help/` is now the production programme-detail route for the practical-employability side of the launch offer.

It exists to explain the broader support promise around CVs, applications, readiness, and next steps without collapsing into a duplicate of the Saturday CV support session page.

Primary implementation:

- `site/src/pages/programmes/[slug].astro`
- `site/src/components/sections/ProgrammeDetailTemplate.astro`
- `site/src/lib/content/site-content.ts#getProgrammeDetailModel`

Canonical content sources:

- `site/src/content/programmes/career-support-cv-help.json`
- `site/src/content/programmePageContent/default.json`
- `site/src/content/faqs/default.json`
- linked live delivery from `site/src/content/sessions/cv-support.json`

## Composition Order

The route now renders a deliberate hierarchy:

1. hero
   - route-specific headline from the look-and-feel brief
   - direct live-route CTA plus contact fallback
   - supporting note that explains why the programme page exists alongside the session page
2. at-a-glance state
   - who the route is for
   - current access state
   - delivery summary
   - trust cues
3. experience section
   - clarifies how practical support should feel before someone arrives
4. programme body
   - explains the wider career-support promise
   - keeps fit/outcomes separate from live session logistics
5. live-route section
   - shows CV support as the active public route
   - explicitly states what the session page owns
   - keeps contact available for people who need guidance first
6. FAQ plus proof boundary
   - answers first practical questions
   - keeps unapproved employability claims out of the public page
7. trust surface and CTA close
   - keeps both live-session and support-enquiry exits visible

## Reusable Family Refinements

Prompt 22 extended the shared family in a reusable way instead of special-casing Career Support markup:

- optional route-level `hero.primaryAction`
- optional route-level `hero.secondaryAction`
- optional route-level `ctaBand`
- shared CTA-band note precedence so a route-specific note can override the default launch note when needed
- reusable structured-data `hasPart` hint for linked live-session programme pages

These refinements are generic enough for later programme routes and future session-linked families.

## Honesty Boundaries

The route now keeps these boundaries explicit:

- approved source material supports CV help, applications support, job readiness, and next-step guidance
- the live recurring offer is the Saturday CV support session
- the programme page explains fit, confidence, and broader practical usefulness
- the session page owns exact recurrence, calendar file, and what-to-bring detail
- wider employment services, placements, guaranteed outcomes, or coaching models remain outside public launch copy

## QA Surface

Prompt 22 added or updated coverage in:

- `site/tests/career-support-page.test.mjs`
- `site/tests/e2e/contracts/career-support-route.spec.mjs`
- `site/tests/e2e/contracts/responsive-behavior.spec.mjs`
- `site/tests/e2e/flows/core-journeys.spec.mjs`
- `site/tests/e2e/support/routes.mjs`
