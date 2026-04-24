# Prompt 39 - Semantic Heading And Landmark Audit

## Audit result

The production routes now pass a shared semantic contract:

- one primary `<h1>` per production route
- header / main / footer landmarks remain intact
- breadcrumbs stay in a dedicated navigation landmark
- disclosures, notices, and helper surfaces do not introduce competing page-title signals
- shell related links add crawlable navigation without adding a second route heading

## What was checked

### Route shells

- `BaseLayout.astro` remains responsible only for landmarks and head metadata.
- `ShellWayfinding.astro` now carries breadcrumbs, back link, notices, and related links without any page-title heading.

### Intro components

- `PageIntro.astro` still owns the page-level `h1` by default.
- Secondary intro uses can opt into `headingLevel={2}` where needed inside a route.

### Detail families

- Programme detail template
- Session detail template
- Editorial event/update detail templates
- Safeguarding family
- Legal/policy routes

These continue to derive their visible page title from one route-specific intro surface rather than duplicating it in the shell.

## Specific protections

- Breadcrumbs use plain text / links only, not heading tags.
- Disclosure notes stay as supporting copy.
- Site notices stay as notice/alert surfaces, not headings that compete with the route title.
- Legal page contents lists remain table-of-contents style navigation, not extra page H1s.
- Related-route navigation now uses `aria-label="Related routes"` and a simple link list only.

## Automated coverage

- `site/tests/e2e/contracts/seo-metadata.spec.mjs` checks single-H1 behavior on representative routes.
- Existing accessibility/trust/structural tests continue to cover shell landmarks, skip links, and readable route structure.
- Responsive coverage confirmed the new related-link surface does not push critical first-screen content out of range once compacted.

## Open watchouts for future prompts

- If Prompt 40 adds breadcrumb structured data, it should reuse the existing breadcrumb trail and not derive a parallel hierarchy.
- If future prompts add a visible social-preview or schema-debug block for internal tooling, it must stay noindex and out of the public heading tree.
- Any future disclosure or trust helper should follow the same rule: supporting surface, not competing page heading.
