# Prompt 19 - Programme Domain Model

## Purpose

Prompt 19 formalizes `Programmes` as the intent-led support layer that sits above `Sessions`.
The canonical facts now live in:

- `site/src/content/programmes/*.json`
- `site/src/content/programmePageContent/default.json`
- `site/src/content/routePages/default.json` for the `/programmes/` overview composition

Source reconciliation remains anchored to:

- `source/blurpint/index.html`
- `source/blurpint/sessions/index.html`
- `source/encouragingyou-site-look-and-feel.md`
- `source/EncouragingYou Website Information .pdf`

## Canonical Entity

Each programme record now owns:

- stable identity: `slug`, `route`, `title`, `shortTitle`
- user-facing meaning: `summary`, `promise`
- audience framing: `audiences`, `audienceSummary`, `audienceHighlights`
- delivery truth: `existingDeliveryMode`, `relatedSessionIds`, `deliverySummary`
- trust framing: `trustSignalIds`, `trustNotes`
- outcome framing: `outcomeBullets`
- narrative detail: `bodySections`
- media and CTA hooks: `featuredMediaId`, `featuredIconId`, `primaryCtaId`
- search/runtime metadata: `launchStatus`, `seoDescription`

## State Model

The runtime now derives honest programme states in `site/src/lib/content/site-content.ts`.

| Runtime state | Trigger | User-facing meaning |
| --- | --- | --- |
| `live-session` | programme is `active-session-linked` and at least one linked session is currently scheduled | this pillar already has a clear live Saturday route |
| `session-limited` | programme is `active-session-linked` but linked sessions are paused, seasonal, contact-only, or otherwise not giving a straightforward next date | the pillar is real, but session detail currently needs more care than a simple timetable claim |
| `overview-only` | programme is `launch-overview-only` | the support area is public now, but the overview page is still the clearest launch surface |
| `enquiry-only` | programme is `growth-planned` | the route is mission-valid now, but access starts with conversation rather than a published recurring session |

## Pillar Mapping

| Programme | Delivery mode | Linked session truth | Launch role |
| --- | --- | --- | --- |
| Community & Friendship | `active-session-linked` | links to `youth-club` | belonging, safe-space, and welcome entry point |
| Personal Growth & Life Skills | `launch-overview-only` | no published recurring session yet | confidence, development, and longer-term growth framing |
| Career Support & CV Help | `active-session-linked` | links to `cv-support` | strongest programme-to-session bridge at launch |
| Community Support / Intergenerational Connection | `growth-planned` | no published recurring session yet | wider-community and future intergenerational mission surface |

## Programme vs Session Boundary

The contract is now explicit:

- programmes explain the support theme, audience fit, gains, and trust cues
- sessions own dates, recurrence, calendar files, and first-visit logistics
- programme cards may point into sessions when a live route exists, but they do not duplicate session logistics
- non-timetabled pillars stay public through overview and contact, not through invented schedules

## Validation

`site/scripts/validate-structured-content.mjs` now enforces:

- audience summaries and audience highlights on every programme
- delivery summary and trust notes on every programme
- valid trust/media/session references
- `join-session` only when a related session actually exists
- no stray `relatedSessionIds` on overview-only or enquiry-led pillars
