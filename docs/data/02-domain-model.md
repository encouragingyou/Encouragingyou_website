# Domain Model

Date: 2026-04-22

Machine-readable schema entry point:

- `site/src/content/config.ts`

Seeded content entry points:

- `site/src/content/**`

## Objective

Prompt 02 converts the project from page-first static HTML into a domain-first content layer.

The new model is designed to:

- keep one canonical source for each business concept
- support launch with local structured files
- remain compatible with a future headless CMS
- generate later route, metadata, schema, and form behavior from typed content rather than duplicated markup

## Domain overview

| Domain | Collection | Role | Key relationships | Derived consumers |
| --- | --- | --- | --- | --- |
| Site settings | `siteSettings` | Global brand, service-area, contact, and disclosure defaults | Referenced by pages, metadata, footer, legal notices | SEO, social metadata, footer, disclosures |
| Launch governance | `launchGovernance` | Launch scope, blockers, trust rules, phase-two backlog | References page ids from `pageDefinitions` | Release readiness, QA, planning |
| Page definitions | `pageDefinitions` | Canonical sitemap and template inventory | Referenced by `navigation`, `launchGovernance`, and later route builders | Routing, nav validation, planning |
| Navigation | `navigation` | Header, quick actions, footer groups | References page ids and icon asset ids | Header, footer, home quick actions |
| Contact info | `contactInfo` | Contact methods, reason options, urgent guidance | Used by forms, contact page, session and safeguarding routes | Contact page, form options, support microcopy |
| Media library | `mediaLibrary` | Canonical asset registry for illustrations and icons | Referenced by programmes, sessions, nav quick actions, notices | Images, icons, alt text, disclosures |
| Programmes | `programmes` | The four support pillars and their narrative meaning | Reference media ids, trust-signal ids, CTA ids, and related session ids | Programme index, programme detail pages, home highlights |
| Sessions | `sessions` | Recurring delivery offers with schedule and contact data | Reference programme ids, media ids, CTA ids, FAQ groups | Session index, session detail pages, event schema, calendar logic |
| FAQs | `faqs` | Reusable grouped questions by context | Referenced by sessions and page contexts | Home FAQ, session FAQ, involvement FAQ |
| Involvement routes | `involvementRoutes` | Join, volunteer, partner, and referral pathways | Reference page ids | Get involved hub, volunteer and partner pages |
| Trust signals | `trustSignals` | Structured trust cues with verification states | Referenced by programmes and future page sections | Trust strips, safeguarding and legal content |
| Safeguarding info | `safeguardingInfo` | Child/adult branches, concern route, vetting note | Connected to contact and trust domains | Safeguarding page, urgent guidance |
| Legal pages | `legalPages` | Legal route definitions and blocking facts | Linked from footer and forms | Privacy, cookies, accessibility, terms |
| Privacy notice | `privacyNotice` | Live privacy-route content, data-flow inventory, and build-state flags | References form surfaces and page ids | `/privacy/`, point-of-collection notes, cookie/processor change control |
| CTA blocks | `ctaBlocks` | Reusable CTA definitions | Referenced by programmes and sessions | Buttons, CTA sections |
| Notices | `notices` | Short reusable notices and disclosures | Referenced by media and forms | AI disclosure, privacy notice snippets, venue notes |

## Entity design choices

### 1. Programmes are first-class entities

The prototype conflated support meaning with session delivery. The new model separates them.

Why:

- the blueprint expects a `Programmes` layer
- two of the four support pillars do not yet map cleanly to named recurring sessions
- carers, referrers, and partners often need service meaning before timetable detail

### 2. Sessions are operational entities

Sessions are modeled separately from programmes because they carry:

- recurring schedule data
- calendar file linkage
- location disclosure policy
- access-model placeholders
- event-schema inputs

This lets one programme relate to one or more delivery routes later without restructuring the whole model.

### 3. Page definitions are explicit content, not implied by file paths

The prototype's routes existed only because HTML files existed. The new model declares page intent and scope separately in `pageDefinitions`.

Why:

- it decouples IA planning from implementation timing
- it gives navigation and launch-scope files a shared page-id vocabulary
- it makes phase-two deferrals explicit

### 4. Trust is modeled as data

Trust signals, notices, safeguarding data, and legal route definitions are not left as incidental copy.

Why:

- the project depends on trust to convert visits into action
- trust copy requires verification status, not just text
- later prompts need to surface the same trust requirements across multiple page types

## Validation rules embedded in the schema

Key validation patterns in `site/src/content/config.ts`:

- page and content lifecycle states are limited to `launch`, `placeholder`, and `phase-two`
- uncertain business facts use explicit statuses such as `placeholder` or `needs-client-confirmation`
- navigation links must declare either a `routeId` or an external `href`
- programmes and sessions must point to media ids, CTA ids, and related entities by stable ids
- legal pages and launch blockers must declare missing facts rather than hiding them in prose

## Derived fields and outputs

The content layer is designed to generate, not duplicate, downstream artifacts.

Derived later from structured inputs:

- route generation from `pageDefinitions`
- header, footer, and quick actions from `navigation`
- image and disclosure rendering from `mediaLibrary` plus `notices`
- session date labels and `Event` schema from `sessions`
- form reason options from `contactInfo`
- trust strips from `trustSignals`
- legal page routing and release checks from `legalPages` plus `launchGovernance`

Current utility already added:

- `site/src/lib/content/session-runtime.ts`

Current import utility already added:

- `site/scripts/import-blurpint-sessions.mjs`
- generated output: `site/src/data/generated/imported-blurpint-sessions.json`

## Open placeholders intentionally preserved

The domain model does not invent missing operational facts. Explicit placeholders remain for:

- public phone number
- named safeguarding lead
- venue public-address policy
- session pricing/access model
- legal details for privacy, cookies, and accessibility statement completion

Those placeholders are part of the model on purpose so later prompts can replace them safely without reworking the schema.
