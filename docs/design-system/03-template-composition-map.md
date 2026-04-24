# Template Composition Map

Date: 2026-04-22

Proof routes now in code:

- `site/src/pages/index.astro`
- `site/src/pages/404.astro`

## Purpose

This map defines how page templates should assemble the component system instead of copying page fragments from `source/blurpint`.

## Shared shell for every route

All public routes should compose through:

1. `BaseLayout`
2. `SiteHeader`
3. route-specific sections or page content
4. `SiteFooter`

This is now the default shell contract for the new app.

## Proof composition: Home page

Implemented route:

- `site/src/pages/index.astro`

Composition order:

1. `BaseLayout`
2. `HomeHero`
3. `SectionHeading` + `ActionCard` grid
4. `SectionHeading` + `SessionSummaryCard` grid
5. `SectionHeading` + `ProgrammeCard` grid
6. `FeatureSplit` for wider community support
7. `SectionHeading` + trust-card composition using `ActionCard`
8. `SectionHeading` + `FaqGroup` + `SupportForm`
9. `FeatureSplit` for get involved

Data sources used:

- `site/src/content/homePage/default.json`
- `site/src/content/navigation/default.json`
- `site/src/content/programmes/*.json`
- `site/src/content/sessions/*.json`
- `site/src/content/faqs/default.json`
- `site/src/content/contactInfo/default.json`
- `site/src/content/trustSignals/default.json`
- `site/src/content/mediaLibrary/default.json`
- `site/src/content/ctaBlocks/default.json`

This route proves:

- the component system can render a meaningful launch route end to end
- route composition can stay data-driven
- the prototype's visual ideas can survive without copied HTML

## Proof composition: 404 page

Implemented route:

- `site/src/pages/404.astro`

Composition order:

1. `BaseLayout`
2. `Breadcrumbs`
3. `EmptyState`
4. `NoticeBlock`

Purpose:

- proves the new system can also handle recovery/fallback states, not only the main marketing route

## Planned template compositions

### About

- `BaseLayout`
- image-led intro section using `FeatureSplit` or a close variant
- mission/vision/trust blocks using `ActionCard`-style or text-panel compositions
- optional quote or lived-experience emphasis using tokenized typography

### Programmes index

- `BaseLayout`
- `SectionHeading`
- `ProgrammeCard` grid using all four programme entries
- support CTA or trust reminder section

### Programme detail

- `BaseLayout`
- hero or intro split with `MediaPicture`
- body sections mapped from structured programme content
- linked session or contact CTA using `ButtonLink`

### Sessions index

- `BaseLayout`
- intro heading
- `SessionSummaryCard` grid
- FAQ / practical guidance section
- support CTA or safeguarding note

### Session detail

- `BaseLayout`
- intro split using session media and structured schedule data
- feature bullets
- FAQ / trust note / contact CTA composition

### Get involved hub

- `BaseLayout`
- intro hero or split section
- `ActionCard` grid for join / volunteer / partner / referral pathways
- FAQ or process section
- shared `SupportForm`

### Volunteer and Partner pages

- `BaseLayout`
- intro split or restrained hero
- repeated text/media section blocks
- `NoticeBlock` for checks, screening, or collaboration expectations
- `SupportForm`

### Contact

- `BaseLayout`
- intro heading
- short contact-method grid
- `SupportForm`
- safeguarding/urgent `NoticeBlock`

### Safeguarding

- `BaseLayout`
- restrained intro
- two-column branch panels
- urgent `NoticeBlock`
- operational contact section

### Legal pages

- `BaseLayout`
- `Breadcrumbs`
- plain article structure
- `NoticeBlock` where operational caveats are needed

## Composition rule for later prompts

Later prompts should prefer:

- assembling pages from these components and structured content

They should avoid:

- copying markup out of `source/blurpint/*.html`
- creating page-specific shell variants unless the route genuinely needs them
