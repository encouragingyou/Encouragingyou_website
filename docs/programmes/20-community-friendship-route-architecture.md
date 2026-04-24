# Prompt 20 - Community & Friendship Route Architecture

## Route Purpose

`/programmes/community-friendship/` is now the first production programme-detail route that fully instantiates the programme family created in Prompt 19.

It exists to explain the belonging-first support offer without collapsing that offer into a timetable page.

Primary implementation:

- `site/src/pages/programmes/[slug].astro`
- `site/src/components/sections/ProgrammeDetailTemplate.astro`
- `site/src/lib/content/site-content.ts#getProgrammeDetailModel`

Canonical content sources:

- `site/src/content/programmes/community-friendship.json`
- `site/src/content/programmePageContent/default.json`
- `site/src/content/faqs/default.json`
- linked live delivery from `site/src/content/sessions/youth-club.json`

## Composition Order

The Community & Friendship route now renders a deliberate sequence instead of a generic detail shell:

1. hero
   - route-specific title and summary
   - programme outcomes, badges, disclosure, and next-step actions
2. at-a-glance state
   - who the route is for
   - current access state
   - delivery summary
   - trust cues
3. experience section
   - explains how participation should feel before someone arrives
4. programme body
   - explains the support promise separately from the live session logistics
5. linked live-opportunity section
   - shows youth club as the current live route
   - keeps venue-on-enquiry and first-contact guidance explicit
6. FAQ plus proof boundary
   - answers first-visit questions
   - keeps unevidenced proof out of the public page
7. trust surface and CTA close
   - reinforces reassurance
   - keeps both the live session and direct support route available

## Content Ownership Rules

The route now uses three distinct content layers on purpose:

- programme JSON
  - enduring promise, audience, outcomes, trust notes, and body narrative
- programme page content
  - route-specific hero, experience framing, linked-opportunity notices, FAQ selection, and evidence boundary
- session JSON
  - timings, calendar output, live next occurrence, and contact subject lines

This prevents the main failure Prompt 20 was trying to avoid:

- programme pages should explain why the support route exists
- session pages should explain when the live offer happens and how to join it

## Reusable Family Additions

Prompt 20 extended `ProgrammeDetailTemplate` with reusable, family-safe inputs rather than route-local markup:

- `hero.badges`
- `hero.supportingNote`
- `experienceSection`
- richer `relatedSessionsSection.notice`
- richer `relatedSessionsSection.panels`
- `faqSection`
- `faqGroupId`
- `faqs`
- `evidenceNotice`

These slots are intentionally generic enough for the remaining programme pillars.

## Route Honesty Boundaries

The Community & Friendship page now keeps four editorial boundaries explicit:

- youth club is the live route, but the programme promise is wider than the timetable
- specific venue details stay enquiry-led until a public-address policy is approved
- named participant stories and venue photography stay out until approved
- direct support/contact remains visible for visitors who are not ready to join the live session yet

## QA Surface

Prompt 20 added route-specific coverage in:

- `site/tests/community-friendship-page.test.mjs`
- `site/tests/e2e/contracts/community-friendship-route.spec.mjs`
- `site/tests/e2e/flows/core-journeys.spec.mjs`
- `site/tests/e2e/contracts/responsive-behavior.spec.mjs`
