# Prompt 08 - Move Depth To Subpages And Prevent Homepage Bloat

You are implementing prompt 08 in `/Users/test/Code/new_website`. Read `changes_prompt/00_verified_materials.md` and verify every internal link before finishing.

## Goal

Ensure content removed from the homepage still exists where it belongs: About, Programmes, Sessions, Get Involved, Contact, Safeguarding, and Events & Updates. The homepage should not slowly grow back into the old long scroll.

## Files To Inspect First

- `site/src/content/routePages/default.json`
- `site/src/content/homePage/default.json`
- `site/src/content/navigation/default.json`
- `site/src/content/involvementRoutes/default.json`
- `site/src/content/formSurfaces/default.json`
- `site/src/content/faqs/default.json`
- `site/src/content/updatesFeed/default.json`
- `site/src/content/safeguardingInfo/default.json`
- `site/src/pages/about/index.astro`
- `site/src/pages/contact/index.astro`
- `site/src/pages/get-involved/index.astro`
- `site/src/pages/events-updates/index.astro`

## Implementation Requirements

1. Confirm each old homepage topic has a destination:
   - organisation story -> `/about/`
   - programme overview -> `/programmes/`
   - current Saturday sessions -> `/sessions/`
   - CV help -> `/programmes/career-support-cv-help/` and `/sessions/cv-support/`
   - youth club -> `/sessions/youth-club/`
   - volunteering/partnership -> `/get-involved/`, `/volunteer/`, `/partner/`
   - contact form -> `/contact/`
   - safeguarding -> `/safeguarding/`
   - events and updates -> `/events-updates/`
2. If a subpage is too thin after the homepage is shortened, strengthen that subpage with verified content rather than adding the content back to the homepage.
3. Add a test or content assertion that the homepage does not render the old full set of 10 sections.
4. Keep the footer and related links available for visitors who need depth.
5. Keep legal and safeguarding routes visible but not overwhelming on the landing page.

## Acceptance Checks

- Every homepage route card points to a page that clearly answers that route's promise.
- No old homepage-only content is lost without another destination.
- Homepage remains compact after this prompt.
- Internal link route check returns HTTP 200 for all homepage, header, footer, and sitemap routes.
- `npm run content:validate` passes.

