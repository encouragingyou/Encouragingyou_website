# Content Gap Register

Date: 2026-04-22

## Launch-ready normalized content now seeded

These domains now have usable structured seed content in `site/src/content/`:

- site settings and baseline brand facts
- launch scope, blockers, and trust requirements
- page and template inventory
- header, footer, and quick actions
- contact methods and enquiry reasons
- media registry for the supplied illustration and icon suite
- four programme entities
- two recurring session entities
- reusable FAQ groups
- involvement pathways
- trust signals
- safeguarding baseline
- legal page outlines
- reusable CTA blocks and notices

## Missing facts that still block full launch readiness

| Gap | Domain | Current handling | Why it matters |
| --- | --- | --- | --- |
| Public phone number | Contact | Explicit `null` + placeholder status in `contactInfo` and `siteSettings` | Needed if the organisation wants a non-email contact route |
| Named safeguarding lead or final concern route wording | Safeguarding | Explicit placeholder in `safeguardingInfo` | Important for trust and operational clarity |
| Public venue policy | Contact / Sessions | Structured as `shared-on-enquiry` but still flagged for confirmation | Affects session detail, contact, and safeguarding content |
| Whether sessions are free or referral-based | Sessions | `priceStatus` and `referralStatus` remain placeholders | Affects conversion copy and referrer guidance |
| Privacy notice details | Legal / Forms | Outline only in `legalPages` | Must be grounded in real form handling and inbox/process choices |
| Cookie and analytics posture | Legal | Outline only in `legalPages` and docs | Determines whether consent logic is required at launch |
| Volunteer role detail | Involvement / Volunteer | Pathway modeled, but role specifics still pending | Needed for the volunteer page to feel credible and fair |
| Partner proof points | Partner | Route exists, but approved logos/names/examples are not available | Needed for partnership credibility |
| Real photography and consent plan | Media | AI disclosure modeled; gallery deferred | Needed before any real-photo trust or gallery section can launch |
| Event/update editorial content | Events & Updates | IA is modeled, but there are no real entries yet | Needed to avoid an empty or thin updates section |

## Placeholder domains versus phase-two deferrals

Placeholder launch domains:

- `contact` page content
- `volunteer` page content
- `partner` page content
- `privacy`, `cookies`, `accessibility`, and `terms` final copy
- `events-updates` editorial entries

Phase-two deferrals:

- gallery
- impact / stories
- team page

## Current assumption log

Assumptions currently encoded in the content layer:

- the public service area anchor is Rochdale
- specific venue details may be shared on enquiry rather than published on-page
- AI illustrations are acceptable for launch if clearly disclosed
- the current recurring session schedule is the one represented in the prototype JS and ICS files

Assumptions that still need explicit business confirmation:

- phone availability
- safeguarding contact naming
- session access rules
- analytics and cookie approach
- volunteer role detail

## Recommended next use by prompt 03

Prompt 03 should use this gap register together with:

- `site/src/content/pageDefinitions/launch.json`
- `site/src/content/navigation/default.json`
- `site/src/content/involvementRoutes/default.json`
- `site/src/content/contactInfo/default.json`

That combination is now sufficient to map audience journeys and conversion goals without scraping `source/blurpint` again.
