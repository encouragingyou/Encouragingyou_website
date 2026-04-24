# Prompt 49 - Approved Content and Verification Matrix

## Publishability States

| State | Meaning | Launch handling |
| --- | --- | --- |
| `verified and publishable` | Confirmed by the supplied PDF brief, prototype source, or current structured production model. | Publish as canonical truth. |
| `verified but requires configuration` | The fact is real, but delivery depends on the correct live environment or route wiring. | Publish only through the canonical config/runtime path. |
| `awaiting approval` | A plausible surface exists, but the organisation has not approved the public asset, wording, or named proof. | Keep out of the live route until approved. |
| `legally sensitive / review required` | The surface is high-trust and public wording must stay narrow until an owner signs it off. | Publish only the limited verified statement; log the gap. |
| `operationally unknown` | The current source set does not confirm the fact. | Do not guess; use a launch-safe omission or enquiry-led fallback. |
| `future-phase` | Intentionally deferred beyond launch. | Keep out of launch routes and track in backlog. |
| `do-not-publish` | Explicitly withheld because publishing would overstate, expose, or mislead. | Exclude entirely from public routes. |

## Evidence Sources

- `/source/EncouragingYou Website Information .pdf`
- `/source/blurpint/index.html`
- `/source/blurpint/about/index.html`
- `/source/blurpint/contact/index.html`
- `/source/blurpint/safeguarding/index.html`
- `/source/blurpint/js/sessions-data.js`
- `/source/blurpint/calendar/*.ics`
- Canonical launch content under `site/src/content/`

## Matrix

| Public surface | Canonical source | State | Evidence basis | Launch handling |
| --- | --- | --- | --- | --- |
| Organisation name and legal name | `site/src/content/siteSettings/default.json` | `verified and publishable` | PDF brief + current launch config | Publish as `EncouragingYou` / `EncouragingYou CIC`. |
| Site URL | `site/src/content/siteSettings/default.json` | `verified but requires configuration` | Production deployment model from Prompt 48 | Keep sourced from config only. |
| Rochdale as the public location anchor | `site/src/content/siteSettings/default.json`, `site/src/content/contactInfo/default.json` | `verified and publishable` | Prototype copy + session data + ICS files | Publish locality only; do not expand beyond Rochdale-centred wording. |
| Mission, vision, and youth-led story | `site/src/content/siteSettings/default.json`, `site/src/content/routePages/default.json` | `verified and publishable` | PDF brief | Publish the youth-led, welcoming, community-strengthening description. |
| Public email | `site/src/content/siteSettings/default.json`, `site/src/content/contactInfo/default.json` | `verified and publishable` | Prototype contact surfaces | Publish `admin@encouragingyou.co.uk` consistently. |
| Instagram | `site/src/content/siteSettings/default.json`, `site/src/content/contactInfo/default.json` | `verified and publishable` | Prototype social link | Publish `https://www.instagram.com/encouragingyou1/`. |
| Public phone number | `site/src/content/siteSettings/default.json`, `site/src/content/contactInfo/default.json` | `operationally unknown` | No approved source evidence | Keep omitted; route people to the secure form and email. |
| Venue disclosure policy | `site/src/content/contactInfo/default.json`, session/programme content | `verified and publishable` | Repeated prototype wording | Publish Rochdale publicly and share exact venue details on enquiry. |
| Homepage, About, programme, and session editorial copy | `site/src/content/homePage/default.json`, `routePages/default.json`, `programmePageContent/default.json`, `sessionPageContent/default.json` | `verified and publishable` | PDF brief + prototype route intent | Publish tightened copy; keep public proof boundaries explicit. |
| Four programme pillars | `site/src/content/programmes/*.json` | `verified and publishable` | PDF brief | Publish as current launch support themes. |
| Saturday CV support and youth club schedules | `site/src/content/sessions/*.json` | `verified and publishable` | Prototype data + ICS | Publish the live recurring session pattern and calendar downloads. |
| Session price and referral rules | `site/src/content/sessions/*.json` | `operationally unknown` | No approved source evidence | Keep absent from public claims; use contact as fallback. |
| Secure enquiry routes | `site/src/content/formSurfaces/default.json`, API runtime | `verified and publishable` | Prompt 33 implementation | Publish as the primary public intake path. |
| Public safeguarding inbox and secure concern form | `site/src/content/safeguardingInfo/default.json` | `verified and publishable` | Prototype safeguarding route + current secure form runtime | Publish role-based safeguarding intake without inventing named contacts. |
| Named safeguarding lead / named role contact | `site/src/content/safeguardingInfo/default.json` | `legally sensitive / review required` | No approved named lead supplied | Keep unnamed; log as release decision item. |
| Public safeguarding policy PDF | `site/src/content/safeguardingInfo/default.json` | `awaiting approval` | No approved public document supplied | Keep the truthful “not linked yet” state. |
| Trained and vetted public statement | `site/src/content/trustSignals/default.json`, `site/src/content/safeguardingInfo/default.json` | `verified and publishable` | PDF brief + prototype safeguarding copy | Publish the narrow statement only; do not expand into unverified procedure claims. |
| Privacy, cookies, accessibility, and site policy pages | `site/src/content/privacyNotice/default.json`, `storageAccess/default.json`, `accessibilityStatement/default.json`, `sitePolicy/default.json` | `verified and publishable` | Current launch runtime and validation layer | Publish as current launch notices. |
| Fixed retention schedule, named processors, future cookie vendors | Privacy/cookie content | `legally sensitive / review required` | Not all future-state details exist yet | Keep current launch truth only; update before any operational change. |
| AI illustrations and disclosure notes | `site/src/content/mediaLibrary/default.json`, `site/src/content/notices/default.json` | `verified and publishable` | Supplied media pack + Prompt 38 governance | Publish with disclosure in approved contexts. |
| AI icon set | `site/src/content/mediaLibrary/default.json` | `verified and publishable` | Supplied media pack | Publish as launch wayfinding icons; vector redraw is deferred. |
| Real participant photography | Media library + source folder state | `future-phase` | Brief explicitly says real images come later | Keep out of launch routes. |
| Partner logos, funder marks, testimonials, case studies | No approved canonical asset source | `awaiting approval` | No permission-cleared proof assets supplied | Withhold from public routes. |
| Exact venue addresses, personal phone numbers, personal email addresses | Contact and safeguarding surfaces | `do-not-publish` | No approved public evidence | Keep omitted from the live build. |
| Gallery, team, and impact-story routes | `site/src/content/launchGovernance/default.json` | `future-phase` | No approved launch content pack | Keep outside launch scope. |

## Result

The launch candidate now has a clear content split:

- Public routes only publish facts supported by the current source set.
- Unknown operational details are either withheld or routed into enquiry-led handling.
- Proof-heavy surfaces such as partner logos, testimonials, named safeguarding contacts, and real photography remain explicitly outside the launch candidate until approved.
