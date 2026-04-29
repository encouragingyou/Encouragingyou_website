# Prompt 02 - Rebuild Homepage As A Compact Route Hub

You are implementing prompt 02 in `/Users/test/Code/new_website`. Read `changes_prompt/00_verified_materials.md` and the contract created by prompt 01 first. Cross-check every route before linking to it.

## Goal

Change the landing page so it is no longer a long scroll through all major pages. It should be a concise, youth-friendly first screen with clear buttons that send visitors to separate pages.

## Files To Inspect First

- `site/src/pages/index.astro`
- `site/src/content/homePage/default.json`
- `site/src/components/sections/HomeHero.astro`
- `site/src/components/ui/ActionCard.astro`
- `site/src/components/ui/ActionCluster.astro`
- `site/src/styles/components.css`
- `site/tests/home-page.test.mjs`
- `site/tests/home-page-model.test.mjs`
- `site/tests/e2e/contracts/homepage-assembly.spec.mjs`

## Implementation Requirements

1. Stop rendering the old full `home.sections.map(...)` stack on `/`.
2. Keep the landing page focused on:
   - hero promise
   - short intro
   - route buttons/cards to the verified pages
   - small trust/safeguarding reassurance
   - footer
3. Use this client-approved line prominently, ideally as the H1 or primary hero headline:
   - `Helping young people in Rochdale build confidence, friendships and future opportunities.`
4. Add a short intro with three plain-language parts:
   - Who it is for: young people in Rochdale. Do not invent a numeric age range.
   - What happens: sessions, CV/application help, youth club, friendship, and practical support.
   - Why it matters: young people can speak up, make friends, feel more confident, and take real next steps.
5. Main route hub buttons/cards should link to verified routes:
   - Join a session -> `/sessions/`
   - Get CV help -> `/programmes/career-support-cv-help/`
   - Youth club -> `/sessions/youth-club/`
   - Programmes -> `/programmes/`
   - About -> `/about/`
   - Get involved -> `/get-involved/`
   - Contact -> `/contact/`
   - Safeguarding -> `/safeguarding/`
6. Do not include the full contact form, full programme grid, full updates feed, full FAQ, or full about story on the homepage.
7. Preserve structured data, canonical metadata, skip links, header, footer, and accessibility landmarks.
8. Update homepage unit and e2e tests so they assert the new compact route-hub contract instead of the old 10-section contract.

## Design Constraints

- No emojis.
- No decorative card nesting.
- No invented claims.
- Route buttons must be obvious and keyboard-accessible.
- Keep old depth available on subpages through links, not hidden or deleted.

## Acceptance Checks

- Browser check at `/` shows the homepage no longer contains all ten old `data-home-section` values.
- Header and hero CTAs navigate to real verified routes.
- Desktop and mobile page height are materially shorter than the audited baseline of 12,948px desktop and 18,806px mobile.
- `npm run test:unit` passes or failures are limited to tests intentionally updated in this prompt and then fixed before finishing.
- If an exact age range is not found in approved source files, no numeric age range appears on the page.

