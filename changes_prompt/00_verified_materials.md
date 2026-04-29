# Verified Materials For Client Change Prompts

Audit date: 2026-04-29 Europe/London.

This file is the evidence base for the ten sequential implementation prompts in this directory. Do not add facts, ages, addresses, phone numbers, testimonials, statistics, partner claims, or external links unless they are re-checked in the implementation turn.

## Client Feedback To Satisfy

- The landing page is too long because it scrolls down into many page-like sections.
- The landing page should act as one clear page. Visitors should click buttons/nav items to reach separate pages instead of finding every page's content by scrolling.
- The client referenced `https://specialpathways.co.uk/` as a similar structure.
- The site should feel more interactive and engaging for a youth organisation, including stronger colours and fonts.
- Current tone feels too business-oriented.
- Add the line: `Helping young people in Rochdale build confidence, friendships and future opportunities.`
- Add a short intro covering who it is for, what happens, and why it matters.
- Replace generic claims like `Build confidence`, `Community & Friendship`, `Personal Growth`, and `Career Support` with specific outcome-led copy.
- Use consistent colours, strong headings, fewer/no emojis, and cleaner structure.

## Reference Site Verification

Reference site checked from the live URL. Do not copy its SEND-specific content, Bradford details, images, policies, statistics, or testimonials. Use it only as proof that the client wants a normal multi-page navigation pattern instead of one huge landing scroll.

Verified live pages:

- `https://specialpathways.co.uk/` returned HTTP 200.
- `https://specialpathways.co.uk/about-us/` returned HTTP 200.
- `https://specialpathways.co.uk/services/` returned HTTP 200.
- `https://specialpathways.co.uk/nannies/` returned HTTP 200. This is the live URL behind the `Local` nav item.
- `https://specialpathways.co.uk/contacts/` returned HTTP 200. This is the live URL behind the `Contact Us` nav item.
- `https://specialpathways.co.uk/policies/` returned HTTP 200.

Observed reference pattern:

- Top navigation links to separate pages: Home, About Us, Services, Local, Contact Us, Policies.
- Home page contains a hero/service intro, service cards, mission/outcome blocks, and footer contact details.
- Deeper content lives on separate pages instead of requiring every topic to sit in one homepage scroll.
- Reference footer repeats contact information and simple opening hours.

## Current Project Facts

- Project root: `/Users/test/Code/new_website`.
- Site root: `/Users/test/Code/new_website/site`.
- Framework: Astro 5.18.1, server output, `@astrojs/vercel` adapter.
- Main homepage route: `/Users/test/Code/new_website/site/src/pages/index.astro`.
- Main homepage content source: `/Users/test/Code/new_website/site/src/content/homePage/default.json`.
- Global navigation source: `/Users/test/Code/new_website/site/src/content/navigation/default.json`.
- Public route source: `/Users/test/Code/new_website/site/src/content/pageDefinitions/launch.json`.
- Global shell builder: `/Users/test/Code/new_website/site/src/lib/content/site-shell.ts`.
- Main public model builder: `/Users/test/Code/new_website/site/src/lib/content/site-content.ts`.
- Main visual tokens/styles: `/Users/test/Code/new_website/site/src/styles/tokens.css`, `/Users/test/Code/new_website/site/src/styles/theme.css`, `/Users/test/Code/new_website/site/src/styles/components.css`.

Verified organisation facts from source:

- Site name: EncouragingYou.
- Legal name: EncouragingYou CIC.
- Service area: Rochdale.
- Public email: `admin@encouragingyou.co.uk`.
- Public phone: not supplied and must not be invented.
- Public venue/address: not supplied and must not be invented.
- Venue detail policy: shared on enquiry.
- Public Instagram URL: `https://www.instagram.com/encouragingyou1/`, checked with HTTP 200.
- ICO complaint URL used by privacy content: `https://ico.org.uk/make-a-complaint/`, checked with HTTP 200.
- Public sitemap URL: `https://www.encouragingyou.co.uk/sitemap.xml`, checked with HTTP 200.

Verified session facts:

- `CV Support Session`: every Saturday, 16:45, 120 minutes, Europe/London, route `/sessions/cv-support/`.
- `Youth Club Session`: every Saturday, 18:45, 120 minutes, Europe/London, route `/sessions/youth-club/`.
- Both sessions list Rochdale as locality and keep exact venue details shared on enquiry.
- Price and referral requirement are placeholders; do not invent them.

Age-group finding:

- The source repeatedly says `young people` but no exact numeric age range was verified.
- The client asked for age group in the intro. If no new approved source is provided during implementation, use `young people in Rochdale` rather than inventing ages such as 11-18 or 16-25. Add a content governance note that the exact age range is pending client confirmation.

## Current Homepage Audit

The homepage is currently data-driven and long:

- `/Users/test/Code/new_website/site/src/pages/index.astro` maps through `home.sections`.
- `/Users/test/Code/new_website/site/src/content/homePage/default.json` currently defines 10 homepage sections:
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

Browser measurement against local dev server:

- Desktop viewport 1440 x 900: homepage document height was about 12,948px.
- Mobile viewport 390 x 844: homepage document height was about 18,806px.
- This confirms the client complaint that the homepage behaves like many pages stacked into one scroll.

Current hero links verified in browser:

- `Join a session` -> `/sessions/`
- `Get support` -> `/contact/`
- `Get CV help` -> `/programmes/career-support-cv-help/`
- `See all programmes` -> `/programmes/`

Current header nav verified in browser:

- About -> `/about/`
- Programmes -> `/programmes/`
- Events & Updates -> `/events-updates/`
- Get Involved -> `/get-involved/`
- Safeguarding -> `/safeguarding/`
- Contact -> `/contact/`
- Header CTA Join a session -> `/sessions/`

## Internal Route Verification

Each canonical launch route returned HTTP 200 from the local dev server:

- `/`
- `/about/`
- `/programmes/`
- `/programmes/community-friendship/`
- `/programmes/personal-growth-life-skills/`
- `/programmes/career-support-cv-help/`
- `/programmes/community-support-intergenerational-connection/`
- `/sessions/`
- `/sessions/cv-support/`
- `/sessions/youth-club/`
- `/events-updates/`
- `/get-involved/`
- `/volunteer/`
- `/partner/`
- `/contact/`
- `/safeguarding/`
- `/safeguarding/child/`
- `/safeguarding/adult/`
- `/privacy/`
- `/cookies/`
- `/accessibility/`
- `/terms/`

Each generated sitemap route also returned HTTP 200 from the local dev server, including these editorial detail routes:

- `/events-updates/community-events-and-workshops/`
- `/events-updates/live-support-stays-on-sessions/`
- `/events-updates/volunteer-partner-or-refer-someone/`

## Validation Results

Commands that passed:

- `npm run build`
- `npm run test:unit`
- `npm run content:validate`
- `npm run discovery:validate`
- `npm run seo:validate`

Important validation gap:

- `npm run links:validate` failed because `/Users/test/Code/new_website/site/scripts/lib/preview-server.mjs` starts `./dist/server/entry.mjs`.
- The current Vercel adapter build emits `.vercel/output/_functions/entry.mjs`, not `dist/server/entry.mjs`.
- Any final QA prompt must either fix this validator or provide an equivalent verified first-party link check before claiming link validation passed.

## Current Tests That Will Need Updating

The current tests intentionally lock the long homepage contract:

- `/Users/test/Code/new_website/site/tests/home-page.test.mjs`
- `/Users/test/Code/new_website/site/tests/home-page-model.test.mjs`
- `/Users/test/Code/new_website/site/tests/e2e/contracts/homepage-assembly.spec.mjs`
- Visual snapshots under `/Users/test/Code/new_website/site/tests/e2e/visual/route-visual-regression.spec.mjs-snapshots/`

Update tests to the new client contract. Do not leave tests asserting that all old homepage sections must be present.

## Source Blueprint To Reuse Carefully

The file `/Users/test/Code/new_website/source/encouragingyou-site-look-and-feel.md` already contains useful brand direction:

- warm, credible, youth-led, welcoming, practical, community-rooted
- supportive rather than institutional
- clear rather than wordy
- human rather than polished-corporate
- youthful, never childish
- practical first, inspirational second
- core palette: Deep Teal `#00405C`, Warm Coral `#FC8C6C`, Soft Sage `#90B4A0`, Warm Cream `#F8E8D0`, Sand `#E6D0B0`, Chalk `#F5F3EF`, Charcoal `#1F2224`, White `#FFFFFF`

The same blueprint recommends a long homepage section order. That part is now superseded by the client feedback in this prompt pack. Reuse the tone, palette, asset, and copy guidance, not the old long homepage structure.

