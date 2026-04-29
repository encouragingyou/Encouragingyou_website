# Landing Page Routing Contract

Audit date: 2026-04-29, Europe/London.

This contract implements prompt 01 from `changes_prompt/01_prompt_scope_and_verified_contract.md`. It records the verified change boundary for the client feedback before production code is changed.

## Current Worktree State

`git status --short` was checked before this document was created. Existing dirty files were:

- `site/public/calendar/cv-support.ics`
- `site/public/calendar/youth-club.ics`
- `site/src/data/generated/media-build-report.json`
- `site/src/data/generated/session-calendar-build-report.json`
- `changes_prompt/`

Those files were not reverted. This prompt adds only this contract note.

## Files Re-Checked

- `site/src/pages/index.astro`
- `site/src/content/homePage/default.json`
- `site/src/content/navigation/default.json`
- `site/src/content/pageDefinitions/launch.json`
- `source/encouragingyou-site-look-and-feel.md`
- `changes_prompt/00_verified_materials.md`
- `site/scripts/lib/preview-server.mjs`

## Verified External URLs

Each URL in this table was checked during this prompt implementation and returned HTTP 200.

| URL                                            | Purpose                                |
| ---------------------------------------------- | -------------------------------------- |
| `https://specialpathways.co.uk/`               | Client reference home page             |
| `https://specialpathways.co.uk/about-us/`      | Client reference About page            |
| `https://specialpathways.co.uk/services/`      | Client reference Services page         |
| `https://specialpathways.co.uk/nannies/`       | Client reference Local page target     |
| `https://specialpathways.co.uk/contacts/`      | Client reference Contact page target   |
| `https://specialpathways.co.uk/policies/`      | Client reference Policies page         |
| `https://www.instagram.com/encouragingyou1/`   | Existing EncouragingYou social link    |
| `https://ico.org.uk/make-a-complaint/`         | Existing privacy notice complaint link |
| `https://www.encouragingyou.co.uk/sitemap.xml` | Existing public sitemap URL            |

## New Homepage Contract

The homepage must become a compact landing and route hub. It must not remain a stacked version of the full website.

The current implementation in `site/src/pages/index.astro` renders `home.sections.map(...)`. The current content file `site/src/content/homePage/default.json` defines ten homepage sections:

- `quick-actions`
- `trust-strip`
- `live-sessions`
- `programme-teasers`
- `about-teaser`
- `community-support`
- `updates-surface`
- `involvement-cta`
- `faq-cluster`
- `contact-panel`

The later implementation prompts must stop rendering all ten old homepage sections on `/`. Depth should move behind page links rather than staying on the landing page.

Primary homepage buttons and route cards must navigate to real routes. They must not rely on homepage section anchors for major content.

## Route Depth Contract

Existing subpages remain the place for detail:

- About: organisation story, youth-led purpose, values, and trust context.
- Programmes: support pillars and programme choice.
- Sessions: live Saturday session details and practical attendance information.
- Events & Updates: confirmed public updates.
- Get Involved: volunteering, partnership, referral, and supporter routes.
- Safeguarding: trust-critical safety information.
- Contact: low-friction enquiry and support routing.

The homepage can summarise these routes briefly, but it should route visitors into these pages for depth.

## Verified Launch Routes

The local route check ran against `http://127.0.0.1:4321` using `site/src/content/pageDefinitions/launch.json`. Every listed public launch route below returned HTTP 200. The `not-found` page was intentionally excluded from the success-route check.

| Page id                                                    | Route                                                         | HTTP status |
| ---------------------------------------------------------- | ------------------------------------------------------------- | ----------: |
| `home`                                                     | `/`                                                           |         200 |
| `about`                                                    | `/about/`                                                     |         200 |
| `programmes`                                               | `/programmes/`                                                |         200 |
| `programme-community-friendship`                           | `/programmes/community-friendship/`                           |         200 |
| `programme-personal-growth-life-skills`                    | `/programmes/personal-growth-life-skills/`                    |         200 |
| `programme-career-support-cv-help`                         | `/programmes/career-support-cv-help/`                         |         200 |
| `programme-community-support-intergenerational-connection` | `/programmes/community-support-intergenerational-connection/` |         200 |
| `sessions`                                                 | `/sessions/`                                                  |         200 |
| `session-cv-support`                                       | `/sessions/cv-support/`                                       |         200 |
| `session-youth-club`                                       | `/sessions/youth-club/`                                       |         200 |
| `events-updates`                                           | `/events-updates/`                                            |         200 |
| `get-involved`                                             | `/get-involved/`                                              |         200 |
| `volunteer`                                                | `/volunteer/`                                                 |         200 |
| `partner`                                                  | `/partner/`                                                   |         200 |
| `contact`                                                  | `/contact/`                                                   |         200 |
| `safeguarding`                                             | `/safeguarding/`                                              |         200 |
| `safeguarding-child`                                       | `/safeguarding/child/`                                        |         200 |
| `safeguarding-adult`                                       | `/safeguarding/adult/`                                        |         200 |
| `privacy`                                                  | `/privacy/`                                                   |         200 |
| `cookies`                                                  | `/cookies/`                                                   |         200 |
| `accessibility`                                            | `/accessibility/`                                             |         200 |
| `terms`                                                    | `/terms/`                                                     |         200 |

## Facts That Must Not Be Invented

The exact numeric youth age range is not verified in the re-checked source files. Use `young people in Rochdale` unless an approved source is added and verified.

Do not invent:

- public phone number
- public venue or address
- pricing
- referral rules
- testimonials
- impact statistics
- partner logos or partner claims
- new external links

The verified service area is Rochdale. The verified public email is `admin@encouragingyou.co.uk`.

## Source Blueprint Status

`source/encouragingyou-site-look-and-feel.md` remains useful for tone, palette, accessibility direction, and youth-led brand posture. Its older long homepage section order is superseded by the client feedback because the client now wants the landing page to be short and click-through rather than a long scroll.

Use the blueprint's warm, credible, youth-led, practical tone and the established palette direction. Do not reuse its old homepage bloat as the target structure.

## Link Validation Gap

`npm run links:validate` was re-run during this prompt and still fails before validating links. The cause is the existing preview-server mismatch:

- `site/scripts/lib/preview-server.mjs` starts `./dist/server/entry.mjs`.
- The current Vercel adapter build emits `.vercel/output/_functions/entry.mjs`.
- The failure message is `Cannot find module '/Users/test/Code/new_website/site/dist/server/entry.mjs'`.

Later QA must fix this validator or run an equivalent first-party link validation against the actual build/dev output before claiming full link validation has passed.
