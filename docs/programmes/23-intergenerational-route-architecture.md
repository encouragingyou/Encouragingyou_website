# Prompt 23 - Intergenerational Route Architecture

## Route Purpose

`/programmes/community-support-intergenerational-connection/` is now the programme-detail route that broadens the public site beyond youth-session discovery without breaking the youth-led core of the brand.

Primary implementation:

- `site/src/pages/programmes/[slug].astro`
- `site/src/components/sections/ProgrammeDetailTemplate.astro`
- `site/src/lib/content/site-content.ts#getProgrammeDetailModel`

Canonical content sources:

- `site/src/content/programmes/community-support-intergenerational-connection.json`
- `site/src/content/programmePageContent/default.json`
- `site/src/content/faqs/default.json`
- route metadata in `site/src/content/pageDefinitions/launch.json`

## Composition Order

The route now renders a specific cross-age narrative instead of falling back to the generic programme family only:

1. hero
   - route-specific intergenerational headline
   - contact-first CTA
   - sessions fallback CTA
   - explicit youth-led but wider-welcome note
2. at-a-glance state
   - audience fit
   - enquiry-led access state
   - delivery summary
   - trust notes
3. audience-routing layer
   - direct support/contact path
   - ask-on-behalf path
   - live-sessions fallback
   - supporter/get-involved path
4. experience section
   - explains how the route should feel before anyone enquires
5. programme body
   - defines the verified scope
   - defines who the route helps
   - explains launch-state access rules
6. delivery section
   - renders enquiry notice and empty-state shape instead of fake session cards
   - keeps community-events disclosure explicit
7. FAQ, proof boundary, and CTA close
   - answers first trust questions
   - keeps care-service and proof boundaries visible
   - adds safeguarding escalation near the final CTA

## Family Extension

Prompt 23 adds one reusable programme-family slot:

- `audienceRoutesSection`

That slot now lives in:

- `site/src/content/config.ts`
- `site/src/lib/content/site-content.ts`
- `site/src/components/sections/ProgrammeDetailTemplate.astro`

The slot is intentionally generic:

- heading plus summary
- icon-led cards
- one explicit action per audience card
- optional tone override

This lets later multi-audience offers stay inside the same family instead of creating route-local markup.

## Editorial Boundary

The route is intentionally not:

- a youth-club page
- a standing events index
- a volunteer page
- a formal elderly-care portal

Its job is to define the wider welcome and route people into the right next step honestly.
