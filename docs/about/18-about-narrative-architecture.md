# About Narrative Architecture

Prompt 18 rebuilds `/about/` into a story-led production route instead of a thin supporting page.

## Canonical inputs

- `source/blurpint/about/index.html`
- `source/EncouragingYou Website Information .pdf`
- `source/encouragingyou-site-look-and-feel.md`
- `site/src/content/routePages/default.json`
- `site/src/content/siteSettings/default.json`
- `site/src/content/trustSignals/default.json`
- `site/src/lib/content/site-content.ts`

The route now treats the PDF brief as the narrative truth source, the look-and-feel file as layout/tone direction, and `routePages.default.json` as the publishable content contract.

## Reading order

The production route lives in `site/src/pages/about/index.astro`.

It now renders in this order:

1. hero with illustration, disclosure, and route-level CTAs
2. origin story / lightbulb moment
3. mission, vision, and what drives the work
4. youth-led leadership / lived-experience framing
5. how the work is delivered in practice
6. values list
7. audience framing
8. wider-community commitment
9. trust signals plus proof-boundary panel
10. final CTA band into Programmes, Sessions, Contact, and Get involved

This keeps the page narrative-first while still ending in real next steps.

## Component layer

Prompt 18 adds two new reusable presentation primitives:

- `site/src/components/sections/NarrativeSection.astro`
- `site/src/components/ui/ValuesList.astro`

`NarrativeSection` is the route’s main story block. It supports paragraphs, bullets, badges, quotes, notices, actions, optional media, and disclosure handling without collapsing the story into generic cards.

`ValuesList` replaces a card grid with icon-led editorial rows. It is intended for values, principles, or standards surfaces where the page should read more like a narrative system than a dashboard.

The rest of the route stays on shared primitives:

- `PageIntro`
- `PageSection`
- `SectionHeading`
- `CardPanel`
- `CtaBand`

## Runtime boundary

`getAboutPageModel()` is now the single runtime entrypoint for the route.

Key behaviors:

- mission and vision come from `siteSettings`, not duplicated strings inside the About route
- public CTAs resolve from structured route/action references
- trust cards resolve from canonical trust signals
- illustration disclosure comes from the media library
- proof-boundary content stays explicit and renderable as data rather than route-local copy
- `AboutPage` structured data is attached through `BaseLayout`
