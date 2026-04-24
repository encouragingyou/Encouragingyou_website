# Foundation Audit

Date: 2026-04-22
Prompt: `01 - Foundation Audit -> Gap Matrix -> Target Architecture Baseline`

## Scope and inputs

This audit used the following inputs:

- `source/blurpint/**` as the current working prototype
- `source/encouragingyou-site-look-and-feel.md` as the blueprint
- `source/EncouragingYou Website Information .pdf` as the business brief
- `source/media_attachment/**` as the raw illustration and icon archive
- `source/blurpint/.playwright-cli/**` as existing QA artifacts

## Executive summary

`/source/blurpint` is a polished static prototype, not a production-ready launch architecture.

It proves that the visual direction, core Saturday-session messaging, and illustration-led brand language can work well online. It also already includes some solid baseline practices: local assets only, skip links, semantic sectioning, reduced-motion support, responsive images, and visible privacy and safeguarding links.

It does not yet satisfy the product described in the blueprint and PDF brief. The strongest gaps are structural rather than cosmetic:

- the information architecture is incomplete
- content is hardcoded across duplicated HTML files
- session data is split across HTML, JavaScript, and ICS files
- contact flows rely on `mailto:` forms
- legal and trust content is placeholder-level
- there is no scalable content model, component architecture, build system, or deployment/testing baseline

The right next move is not to keep extending `/source/blurpint` in place. The right move is to preserve it as a reference implementation and migrate into a new static-first Astro application with typed content collections, componentized layouts, server-side or serverless forms, and a clear future CMS boundary.

## Repository census

### Current route inventory

The prototype currently exposes 8 HTML routes:

| Route | File | Current role | Audit note |
| --- | --- | --- | --- |
| `/` | `source/blurpint/index.html` | Home page | Strong visual home-page prototype with quick actions, trust strip, FAQ, contact teaser, and volunteer CTA. Missing updates/events module and dedicated contact route. |
| `/about/` | `source/blurpint/about/index.html` | About page | Short mission page with credibility framing. Missing fuller lived-experience, mission/vision, and team proof from the brief. |
| `/sessions/` | `source/blurpint/sessions/index.html` | Session hub | Clear Saturday-session hub for CV support and youth club. Currently standing in for both programmes and session discovery. |
| `/sessions/cv-support/` | `source/blurpint/sessions/cv-support/index.html` | Session detail | Good launch-style baseline for one recurring session. Missing fuller logistics, FAQ depth, accessibility notes, and non-email conversion. |
| `/sessions/youth-club/` | `source/blurpint/sessions/youth-club/index.html` | Session detail | Good launch-style baseline for one recurring session. Missing fuller logistics, FAQ depth, accessibility notes, and non-email conversion. |
| `/get-involved/` | `source/blurpint/get-involved/index.html` | Mixed involvement hub | Combines volunteer, partner, and referral interest into one route. Missing dedicated volunteer and partner pages. |
| `/safeguarding/` | `source/blurpint/safeguarding/index.html` | Safeguarding summary | Visible and serious in tone. Missing named safeguarding contact, escalation detail, vetting/training specifics, and fuller policy linkage. |
| `/privacy/` | `source/blurpint/privacy/index.html` | Privacy summary | Short privacy explainer. Missing a production-ready notice grounded in actual data flows and user rights. |

### Shared implementation baseline

The prototype uses a very small static stack:

- 8 HTML files
- 1 global stylesheet: `source/blurpint/assets/css/styles.css`
- 1 global script: `source/blurpint/assets/js/site.js`
- 1 local font file: `source/blurpint/assets/fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2`
- 2 ICS calendar files
- 1 `sitemap.xml`
- 1 `robots.txt`
- 1 `favicon.svg`
- 50 derived image assets in AVIF/WebP
- 10 Playwright artifacts under `.playwright-cli`

The `package.json` in `source/blurpint/` only provides:

- `npm run build:images`
- `npm run serve`

There is no framework, no type-checking, no linting, no formatter, no test runner, no build output step, and no deployment configuration in the current prototype.

### Current asset pipeline

The media pipeline is one of the more reusable parts of the prototype.

- Raw source illustrations and icons live in `source/media_attachment/`
- `source/blurpint/scripts/build-images.sh` uses `ffmpeg` to generate responsive AVIF and WebP image sets
- 7 illustration sources are converted into responsive image sets
- 8 icon PNGs are converted into single-size WebP icons

What is good:

- raw artwork is preserved outside the prototype
- derived assets are local and performant
- file naming is already human-readable and close to content meaning

What is missing:

- icons are not vectorized to SVG
- generated assets are not tied to a typed content model
- there is no manifest connecting raw assets, derived assets, alt text, disclosure rules, and page usage

### Current JavaScript behavior

`source/blurpint/assets/js/site.js` is small and targeted. It currently:

- calculates the next Saturday occurrence for two recurring sessions
- updates human-readable next-date labels in the UI
- injects `Event` JSON-LD into the two session detail pages
- reveals elements on scroll with `IntersectionObserver`
- updates the footer year

This is a reasonable prototype script, but it also shows current duplication problems:

- session data lives in JavaScript
- session labels and times also live in HTML
- recurring event data also lives in `.ics` files
- the same content will drift unless it moves into a single structured source

### Current metadata and QA artifacts

Metadata files:

- `source/blurpint/sitemap.xml`
- `source/blurpint/robots.txt`
- `source/blurpint/favicon.svg`

QA artifacts found:

- 1 browser console log
- 6 Playwright page structure captures
- 3 Playwright screenshots

Observed QA note from existing artifacts:

- the captured console log shows a `404` for `favicon.ico`
- the captured mobile home-page screenshot shows the full navigation stacking above the hero rather than collapsing into a purpose-built mobile navigation pattern

## What is hardcoded, derived, and reusable

| Category | Current state | Implication |
| --- | --- | --- |
| Hardcoded page content | All page copy, nav items, footer items, CTAs, FAQs, trust statements, and contact details live directly in HTML files. | Any content change requires editing multiple files by hand. |
| Hardcoded site shell | Header and footer markup are duplicated across all HTML files. | Navigation and legal-link changes will drift over time. |
| Hardcoded legal/trust copy | Privacy and safeguarding pages are static HTML summaries. | Not suitable for evolving operational policy or compliance review. |
| Derived runtime content | Next-session dates and `Event` schema are generated client-side from a small JS object. | Visitors without JavaScript still get the page, but structured data and freshness logic are not build-driven. |
| Derived media | Responsive images are built from raw artwork via script. | Good foundation for future automated asset handling. |
| Reusable visual patterns | Buttons, cards, disclosure captions, badges, FAQ blocks, and grid patterns already exist in CSS. | These should become components in the new app rather than copied HTML fragments. |
| Reusable content concepts | Session cards, trust strips, programme cards, and CTA panels map well to later content modules. | Strong candidate modules for the new component/content system. |

## Intent extraction from the blueprint and PDF brief

### Audiences the final site must serve

Across the blueprint and PDF brief, the site needs to support at least these audience groups:

- young people seeking support, confidence, friendship, or CV help
- parents, carers, schools, and referrers seeking reassurance and a safe route to support
- wider community members, including older or isolated people needing connection or practical help
- volunteers, partners, and funders seeking proof, clarity, and trusted routes into collaboration

### Product intent that exceeds the current prototype

The blueprint and PDF describe a broader product than the current site implements:

- a `Programmes` layer, not only `Sessions`
- an `Events & Updates` layer, even if editorially light at launch
- a real `Contact` page
- separate volunteer and partner pathways
- explicit launch trust requirements around safeguarding, privacy, consent, and AI-art disclosure
- a static-first but CMS-compatible architecture

### Trust requirements made explicit by the inputs

The trust model is a core product requirement, not a footer detail. The final launch needs:

- visible safeguarding routes
- clear privacy handling at points of data capture
- calm and credible contact options
- trained and vetted team language that is backed by real process
- AI-art disclosure on illustration-led areas
- a handoff path to real, consented photography for trust-critical areas later

### Content and data domains implied by the brief

The brief already implies structured domains that should not stay embedded in static HTML:

- site settings and contact information
- programmes
- recurring sessions
- events
- updates/news
- FAQs
- safeguarding information
- legal notices
- volunteer opportunities or role pathways

## Delta between implemented prototype and intended product

### What the prototype already proves

- The art direction is aligned with the blueprint.
- The current palette and warm, soft-surface treatment are close to the intended tone.
- The home page already uses a strong narrative structure: hero, quick actions, session strip, programmes, trust, FAQ, and conversion CTA.
- The project already prefers local assets, low-JS behavior, and progressive enhancement.
- The existing session content is specific enough to seed real structured content later.

### Where the prototype stops short

- Navigation does not match the blueprint's final launch model.
- There is no Programmes overview page or programme detail set.
- There is no Events & Updates index or reusable event/update template.
- There is no Contact page.
- Volunteer and partner journeys are merged rather than distinct.
- Forms are not production-safe.
- Legal pages are summaries, not operational documents.
- Metadata and structured data are inconsistent across routes.
- Repeated HTML means the prototype cannot scale safely.

## Missing business facts that later prompts must surface

The blueprint and PDF both leave some launch-critical facts unresolved. Later prompts should treat these as tracked assumptions until confirmed.

- confirmed public phone number
- confirmed public postal or venue address policy
- whether sessions are free, open access, or referral-based
- named safeguarding contact and escalation route
- volunteer role details and time commitments
- exact privacy notice wording and real data retention approach
- whether any cookies or analytics will be introduced at launch
- approved partner logos or names
- real photography plan and consent process
- testimonials, if any, and permission status
- future event schedule data beyond the two Saturday recurring sessions

## Audit conclusion

The current starting point is useful, but it must be treated as:

- a reference implementation for visual direction
- a source of reusable copy and component ideas
- a source archive for raw artwork and derived images

It should not be treated as the final application architecture.

The recommended baseline is:

- keep `source/blurpint/` intact as reference
- start a new Astro application outside the prototype
- move to typed structured content and generated routes
- centralize session/event data so pages, schema, and ICS files come from one source
- replace `mailto:` forms with server-side or serverless handling
- rebuild launch IA around Programmes, Contact, legal trust routes, and future editorial growth
