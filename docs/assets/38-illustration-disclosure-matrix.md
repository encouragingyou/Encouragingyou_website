# Prompt 38 - Illustration Disclosure Matrix

## Purpose

Prompt 38 turns AI-illustration honesty into a canonical system instead of a route-by-route caption.

The live truth source is:

- `site/src/content/mediaLibrary/default.json`
- `site/src/content/notices/default.json`
- `site/src/lib/content/media-disclosure.ts`

## Disclosure Variants

| Variant | Canonical text | Intended placement |
| --- | --- | --- |
| Prominent | `AI-generated illustration — not a photograph of participants.` | Hero, split-feature, narrative, and detail-image surfaces |
| Compact | `Launch illustration, not participant photography.` | Repeated cards and listing media where the fuller note would become visual noise |
| Sitewide | `Illustrations on this launch site are AI-generated unless stated otherwise.` | Footer-wide launch disclosure |

## Asset Classes

| Class | Current source type | Evidence status | Visible disclosure | Replacement target |
| --- | --- | --- | --- | --- |
| Homepage, about, programme, session, and involvement illustrations | `ai-generated-people-illustration` | `illustrative-only` | Yes. Prominent on large feature/detail placements, compact on cards/listings | Consented documentary or team photography |
| Wayfinding icons | `ai-generated-icon` | `wayfinding-only` | No | Redrawn vector icon set |
| Future documentary participant photography | `consented-documentary-photo` | May become proof-bearing only after approval and review | Not an AI disclosure; use normal alt/caption rules | Canonical long-term proof surface |
| Future team photography | `consented-team-photo` | Team/profile evidence only after approval | Not an AI disclosure | Canonical about/team surface |
| Future event photography | `consented-event-photo` | Event recap evidence only after approval | Not an AI disclosure | Canonical event recap/gallery surface |

## Current Launch Rules

- All live illustrations are synthetic people-based images and are marked `consentStatus: not-applicable-synthetic`.
- All live illustrations are restricted from `gallery`, `testimonials`, `team`, `impact-proof`, `event-recap-evidence`, and `safeguarding`.
- Icons stay undisclosed because they are treated as wayfinding primitives, not participant proof.
- `DisclosureNote` now renders `data-disclosure`, `data-disclosure-variant`, `data-disclosure-context`, and `data-notice-id` so UI tests can validate placement without brittle text-only selectors.

## Context Contract

| Context | Variant |
| --- | --- |
| `hero` | Prominent |
| `feature` | Prominent |
| `narrative` | Prominent |
| `detail` | Prominent |
| `card` | Compact |
| `listing` | Compact |
| `sitewide` | Sitewide notice variant |

## Protected Routes

- `/`
- `/about/`
- `/programmes/`
- `/programmes/[slug]/`
- `/sessions/[slug]/`
- `/get-involved/`
- `/volunteer/`
- `/partner/`
- `/events-updates/[slug]/`
- Footer-wide note on all shell routes
