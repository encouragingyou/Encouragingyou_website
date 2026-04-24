# Sitemap and Template Map

Date: 2026-04-22
Prompt: `02 - Information Architecture + Structured Content/Data Integration Engine`

Machine-readable counterparts now live in:

- `site/src/content/pageDefinitions/launch.json`
- `site/src/content/navigation/default.json`
- `site/src/content/launchGovernance/default.json`

## Launch audiences and page intent

The normalized IA prioritizes six launch audiences:

- young people who want support, confidence, friendship, or CV help
- parents and carers who need reassurance and clarity
- referrers who need a safe, legible route into support
- wider community members who may need connection or practical help
- volunteers who need role clarity and fair expectations
- partners and funders who need proof of credibility and safe operations

The IA principle is simple:

- first-step clarity on the home page
- programme-level meaning before session-level logistics
- trust routes visible from every high-anxiety decision point
- legal and safeguarding routes treated as core product infrastructure, not footer afterthoughts

## Primary navigation model

Header navigation for launch:

- `About`
- `Programmes`
- `Events & Updates`
- `Get Involved`
- `Safeguarding`
- `Contact`

Header CTA:

- `Join a session`

Home-link behavior:

- logo returns to home
- `Home` does not need a duplicated primary-nav label

Reasoning:

- keeps the top nav short, as the blueprint recommends
- makes `Safeguarding` permanently visible
- separates `Programmes` from `Sessions` so the site can explain support pillars without forcing timetable-first browsing
- keeps `Contact` explicit because low-friction support is a primary job of the site

## Footer model

Footer groups for launch:

- Explore: About, Programmes, Sessions, Events & Updates
- Get Support: Get Involved, Volunteer, Partner, Contact, Safeguarding
- Legal: Privacy Notice, Cookie Notice, Accessibility Statement, Terms / Site Policy
- Social: Instagram

The footer is also expected to surface:

- the public email address
- the AI illustration disclosure where helpful
- accessibility and privacy routes

## Launch sitemap

| Route | Template | Primary purpose | Primary audiences | Status |
| --- | --- | --- | --- | --- |
| `/` | `home` | Route visitors into support, programmes, sessions, and trust content | Young people, parents/carers, community members | Launch |
| `/about/` | `about` | Explain mission, vision, youth-led credibility, and lived-experience framing | Young people, carers, partners, funders | Launch |
| `/programmes/` | `programme-index` | Show the four support pillars | Young people, carers, referrers, community members | Launch |
| `/programmes/community-friendship/` | `programme-detail` | Explain belonging and safe-space support | Young people, carers | Launch |
| `/programmes/personal-growth-life-skills/` | `programme-detail` | Explain confidence-building and life-skills support | Young people, carers, referrers | Launch |
| `/programmes/career-support-cv-help/` | `programme-detail` | Explain CV and job-readiness support | Young people, carers, referrers | Launch |
| `/programmes/community-support-intergenerational-connection/` | `programme-detail` | Explain broader community and intergenerational support | Community members, older people, partners, referrers | Launch |
| `/sessions/` | `session-index` | Join-a-session hub for current recurring offers | Young people, carers, referrers | Launch |
| `/sessions/cv-support/` | `session-detail` | Explain the CV support session and next steps | Young people, carers, referrers | Launch |
| `/sessions/youth-club/` | `session-detail` | Explain the youth club session and first-time reassurance | Young people, carers | Launch |
| `/events-updates/` | `updates-index` | Keep the site current without a heavy editorial burden | Community members, partners, young people | Launch |
| `/get-involved/` | `get-involved-hub` | Route visitors into volunteer, partner, referral, or support paths | Volunteers, partners, referrers, community members | Launch |
| `/volunteer/` | `volunteer-detail` | Explain volunteer role pathways, checks, and support | Volunteers, community members | Launch |
| `/partner/` | `partner-detail` | Explain referral, sponsorship, and collaboration routes | Partners, funders, referrers | Launch |
| `/contact/` | `contact` | Provide low-friction contact options and enquiry form | All main audiences | Launch |
| `/safeguarding/` | `safeguarding` | Provide child/adult safeguarding routes and clear guidance | Carers, referrers, partners, young people | Launch |
| `/privacy/` | `legal` | Explain how enquiry data is handled | All form and contact users | Launch |
| `/cookies/` | `legal` | Explain cookie usage and consent stance | All visitors | Launch |
| `/accessibility/` | `legal` | Explain accessibility commitment and support route | All visitors | Launch |
| `/terms/` | `legal` | Provide basic site-use policy | All visitors | Launch |
| `/404/` | `not-found` | Recover from broken links without losing trust | All visitors | Launch |

## Template inventory

Launch templates:

- `home`
- `about`
- `programme-index`
- `programme-detail`
- `session-index`
- `session-detail`
- `updates-index`
- `get-involved-hub`
- `volunteer-detail`
- `partner-detail`
- `contact`
- `safeguarding`
- `legal`
- `not-found`

Template notes:

- `programme-detail` must support both currently active delivery routes and mission-level programme framing where live session detail is still growing.
- `session-detail` should read from structured recurring session data, not hardcoded timetable fragments.
- `legal` should support table-of-contents behavior and long-form readable content later.
- `updates-index` should work with zero or few entries without making the site feel abandoned.

## Launch vs later partition

Launch pages are intentionally broader than the current prototype but narrower than the full eventual site.

Explicitly deferred to phase two:

- `/gallery/`
- `/impact-stories/`
- `/team/`

Reason for deferral:

- the brief does not yet provide consented photography, approved proof stories, or bios/headshots

## IA implementation note

Prompt 02 does not migrate full page bodies yet. Instead, it establishes:

- the route and template inventory
- the nav and footer model
- the structured domains that later prompts will use to render those routes

This prevents later prompts from re-deciding core IA while still leaving page-specific content work to the relevant prompt in sequence.
