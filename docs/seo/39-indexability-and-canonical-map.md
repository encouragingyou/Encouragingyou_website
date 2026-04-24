# Prompt 39 - Indexability And Canonical Map

## Production source of truth

- `site/src/content/seo/default.json` is the explicit route-intent and indexability register.
- `site/src/lib/content/site-seo.ts` converts those directives plus canonical route content into HTML-ready metadata.
- `site/src/layouts/BaseLayout.astro` emits the final `<title>`, description, canonical, robots, Open Graph, and Twitter tags in the initial HTML.

## Global rules

- Canonical strategy: self-canonical only. No substantive route canonicalizes to another content route.
- URL format: trailing slash canonical URLs, matching `astro.config.mjs`.
- Default robots: `index,follow`.
- Noindex robots: `noindex,follow`.
- Share-image fallback: `hero-home`, but only when the target route is indexable and the media truth model allows that route family.

## Route map

| Route family | Canonical target | Indexability | Rationale |
|---|---|---|---|
| `/` | self | `index,follow` | Primary search landing page for youth-led support in Rochdale. |
| `/about/` | self | `index,follow` | High-value trust and mission page with distinct search intent. |
| `/programmes/` | self | `index,follow` | Programme comparison hub with a different intent from live sessions. |
| Programme detail routes | self | `index,follow` | Each pillar is a substantive route with unique purpose, copy, and handoff logic. |
| `/sessions/` | self | `index,follow` | Live recurring-offer hub with operational value as a search landing page. |
| Session detail routes | self | `index,follow` | Distinct high-intent landing pages for named recurring offers. |
| `/events-updates/` | self | `index,follow` | Editorial hub for current dates, opportunities, and updates. |
| Editorial detail routes | self | `index,follow` only when `item.indexVisible === true` | Current public items remain indexable; future archived/closed/superseded items can stay reachable but noindex. |
| `/get-involved/` | self | `index,follow` | High-value hub for volunteers, partners, referrers, and supporter journeys. |
| `/volunteer/` | self | `index,follow` | Distinct volunteering search intent with unique screening/process content. |
| `/partner/` | self | `index,follow` | Distinct collaboration and referral search intent. |
| `/contact/` | self | `index,follow` | Legitimate local-intent landing page for questions, referrals, and support requests. |
| `/safeguarding/` | self | `index,follow` | Public safeguarding guidance route with serious standalone user value. |
| `/safeguarding/child/` | self | `index,follow` | Distinct child safeguarding landing page. |
| `/safeguarding/adult/` | self | `index,follow` | Distinct adult safeguarding landing page. |
| `/privacy/` | self | `noindex,follow` | Important trust route, but not meant to compete as an acquisition landing page. |
| `/cookies/` | self | `noindex,follow` | Important compliance route, but low-value as a search landing page. |
| `/accessibility/` | self | `noindex,follow` | Important accessibility evidence route, but intended to be reached from trust flows. |
| `/terms/` | self | `noindex,follow` | Practical site policy route, intentionally linked but not search-led. |
| `/404/` | self | `noindex,follow` | Recovery surface only. |
| `/system/components/` | self | `noindex,follow` | Internal QA harness only. |

## Why the legal pages are noindex

- They remain fully linked from the footer, utility nav, shell related links, and form privacy surfaces.
- They still emit self-canonicals so crawlers understand the stable public URL.
- `follow` is preserved so linked production routes continue to be discovered naturally.
- This keeps the search-facing surface focused on support, sessions, programmes, involvement, contact, and safeguarding rather than policy pages.

## Editorial detail rule

- The `Events & Updates` detail family is the one conditional indexability surface.
- `site/src/lib/domain/editorial-feed.js` computes `indexVisible`.
- `site/src/lib/content/site-content.ts` passes that state into `buildMeta(...)`.
- Result: current items can rank, but archived/closed/superseded detail pages do not have to stay indexable simply because the route still exists.

## Prompt 40 dependency

Prompt 40 should treat this document as the canonical decision layer for:

- `robots.txt` generation
- sitemap inclusion/exclusion
- structured-data emission on current vs noindex routes
- future preview-image and social-asset expansion
