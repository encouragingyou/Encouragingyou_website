# Prompt 21 - Personal Growth Route Architecture

## Route Purpose

`/programmes/personal-growth-life-skills/` is now the first production programme-detail route that uses the family in a low-schedule, enquiry-led way instead of mapping directly to one live recurring session.

It exists to explain a real support direction that is already public at launch while staying honest about the fact that the site does not yet publish a standalone recurring timetable for it.

Primary implementation:

- `site/src/pages/programmes/[slug].astro`
- `site/src/components/sections/ProgrammeDetailTemplate.astro`
- `site/src/lib/content/site-content.ts#getProgrammeDetailModel`

Canonical content sources:

- `site/src/content/programmes/personal-growth-life-skills.json`
- `site/src/content/programmePageContent/default.json`
- `site/src/content/faqs/default.json`
- trust and route-shell support from existing shared collections

## Composition Order

The route now renders a deliberate confidence-pathway sequence:

1. hero
   - explicit title from the prompt guidance
   - practical summary, badges, disclosure, and contact-first CTA
2. at-a-glance state
   - audience fit
   - current access state
   - delivery summary
   - trust cues
3. experience section
   - frames how confidence-building support can feel without inventing exact formats
4. programme body
   - separates confirmed support themes from timetable assumptions
5. current delivery path section
   - renders a structured empty state instead of blank space
   - explains why contact comes first
   - keeps a cross-link into live Sessions visible
6. FAQ plus proof boundary
   - answers first practical questions
   - keeps unevidenced workshop detail out of the public route
7. trust surface and CTA close
   - keeps privacy, safeguarding, and next-step contact visible

## Family Extension

Prompt 21 refined the shared programme-detail family rather than forking a special Personal Growth page.

Reusable additions:

- actionable `relatedSessionsSection` notices for every delivery-state branch
- `relatedSessionsSection.emptyState` for routes with no public session cards yet
- shared rendering of low-schedule delivery panels beside either session cards or the empty state
- CTA-band support for a `See current sessions` action when a programme is not live-linked
- `EmptyState` heading-level support so section-level empty states stay semantic inside long-form pages

## Honesty Boundaries

The route now keeps these boundaries explicit:

- confidence-building, life skills, mentoring, motivation, and practical guidance are supported by source material
- public workshop dates, mentor profiles, outcome claims, and workshop photography are not yet publishable
- the route should feel useful now, but the first operational next step is still an enquiry
- live Sessions remain the clearest public fallback when someone needs something scheduled today

## QA Surface

Prompt 21 added or updated coverage in:

- `site/tests/personal-growth-page.test.mjs`
- `site/tests/programme-route-state.test.mjs`
- `site/tests/programmes-page.test.mjs`
- `site/tests/e2e/contracts/personal-growth-route.spec.mjs`
- `site/tests/e2e/contracts/responsive-behavior.spec.mjs`
- `site/tests/e2e/flows/core-journeys.spec.mjs`
