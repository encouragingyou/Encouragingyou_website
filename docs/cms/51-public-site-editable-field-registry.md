# Prompt 51 - Public-Site Editable Field Registry

## Canonical Source

The machine-readable registry lives in `site/src/content/cmsScope/default.json`.

This document is the human-readable view of that contract.

## Shared Shell

| Route | Client-editable | Operator-controlled | Developer-owned |
| --- | --- | --- | --- |
| global shell and footer | organisation tagline, footer support CTA copy, shared summary text | public email, Instagram, utility/legal destinations, navigation labels if ever exposed | nav structure, shell CTA switching, current-path logic, shell layout |

## Public Routes

| Route | Client-editable | Operator-controlled | Developer-owned |
| --- | --- | --- | --- |
| `/` | hero copy, quick-action labels, trust-strip snippets, homepage section summaries | SEO/share snippets | section order, page composition, motion/layout behavior |
| `/about/` | narrative sections, values copy, intro/CTA text | proof-boundary and trust-governance text, SEO/share text, approved media alt text | narrative-section structure and layout |
| `/programmes/` | intro copy, audience guidance, programme card teasers, badge text | SEO/share text | pillar order, derived live-state behavior, grid structure |
| `/programmes/community-friendship/` | intro/body copy, expectations copy, CTA labels | linked-session notices, venue-disclosure notes, proof-boundary copy, route FAQs, SEO | template structure and linked-session state engine |
| `/programmes/personal-growth-life-skills/` | intro/body copy, enquiry-led empty-state copy, CTA labels | state notices, proof-boundary copy, route FAQs, SEO | template structure and delivery-state logic |
| `/programmes/career-support-cv-help/` | intro/body copy, programme story, CTA labels | linked-session notices, proof-boundary copy, route FAQs, SEO | template structure and state engine |
| `/programmes/community-support-intergenerational-connection/` | intro/body copy, audience-route labels, CTA labels | trust notes, no-care-service boundary, route FAQs, SEO | audience-routing logic and template structure |
| `/sessions/` | intro copy, comparison-card supporting copy, session card summaries | schedule state, logistics metadata, calendar availability text | live-rail derivation, calendar logic, layout behavior |
| `/sessions/cv-support/` | intro, expectation cards, FAQ copy, closing CTA text | schedule, logistics metadata, price/referral state, calendar metadata, SEO | recurring schedule logic, schema generation, template behavior |
| `/sessions/youth-club/` | intro, first-visit reassurance, FAQ copy, closing CTA text | schedule, logistics metadata, price/referral state, calendar metadata, SEO | recurring schedule logic, schema generation, template behavior |
| `/events-updates/` | intro, empty-state guidance, feed-card teaser text | publish state, publish date, pinning, category metadata | filter logic, pinning rules, feed ordering |
| `/events-updates/[slug]/` | item titles, summaries, body sections, fact-rail copy, CTA labels | slug, publish state, item type, SEO/share text, approved media alt text | template selection, related-content logic, schema output |
| `/get-involved/` | intro copy, pathway summaries, process list, CTA labels, spotlight teaser text | pathway state, default enquiry reasons, live-route routing controls | spotlight selection logic, hub state derivation, layout |
| `/volunteer/` | intro, role cards, process notes, FAQs, CTA labels | enquiry helper text, default reason, screening notes, SEO | form schema, validation, route layout |
| `/partner/` | intro, audience sections, collaboration-mode copy, FAQs, CTA labels | proof-boundary copy, enquiry helper text, partnership categories, SEO | form schema, validation, route layout |
| `/contact/` | intro, decision-card copy, method-card summaries, FAQs, CTA labels | public email/social/phone state, location policy, form helper text, SEO | route-state derivation, form validation, secure submission runtime |
| `/safeguarding/` | none | hub intro, branch-card copy, trust notes, concern-form helper text, named-contact state, policy availability, SEO | escalation/state logic, secure concern runtime |
| `/safeguarding/child/` | none | child-route guidance, branch-specific notices, SEO | branch routing and template runtime |
| `/safeguarding/adult/` | none | adult-route guidance, branch-specific notices, SEO | branch routing and template runtime |
| `/privacy/` | none | legal body copy, collection-point records, rights cards, review triggers, privacy contact email, ICO link | legal template composition and schema rendering |
| `/cookies/` | none | storage registry copy, analytics objection labels, future-change guidance | preference persistence, analytics mode, no-banner runtime |
| `/accessibility/` | none | statement copy, known limitations, workarounds, feedback helper text | feedback-form runtime and validation |
| `/terms/` | none | policy copy and any allowlisted external legal references | legal template structure |
| `/404/` | headline, summary, recovery labels | none | fallback routing behavior and 404 template |

## Media and Metadata Rules

### Client-editable

- approved alt text on already-governed media assets
- internal CTA labels that point to route pickers

### Operator-controlled

- SEO snippets
- social/share metadata that derives from SEO fields
- public contact identifiers
- legal and safeguarding metadata
- external destinations
- session operational metadata

### Developer-owned

- actual social-preview rendering templates
- structured data builders
- sitemap and robots generation
- asset delivery logic

## Editorial Boundary Summary

The registry intentionally gives the client broad control over ordinary editorial copy but almost no control over:

- trust-critical operational facts
- legal truth
- safeguarding wording
- public identifiers
- route behavior
- anything that could mutate the public runtime indirectly
