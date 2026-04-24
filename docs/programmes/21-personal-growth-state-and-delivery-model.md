# Prompt 21 - Personal Growth State And Delivery Model

## Current State Choice

Personal Growth & Life Skills currently resolves to `overview-only`.

That choice is deliberate:

- the programme is public and launch-valid now
- the support promise is broader than one recurring slot
- the repo does not have verified public dates, frequency, or dedicated session logistics for this pillar

Canonical source of truth:

- `site/src/content/programmes/personal-growth-life-skills.json#existingDeliveryMode`
- `site/src/lib/domain/programme-route-state.js`
- `site/src/lib/content/site-content.ts#buildProgrammeStateModel`

## User-Visible State Surface

For this route, `overview-only` now drives:

- the soft `Programme overview` access badge
- a route-specific overview notice in the delivery section
- a structured delivery empty state instead of missing content
- a primary `Get support` action
- a visible `See current sessions` fallback link
- a CTA-band action set of `Get support`, `See current sessions`, and `Back to programmes`

## Delivery-Section Rules

The shared delivery section now supports two shapes:

1. live-linked programmes
   - session cards on the primary side
   - active or fallback notices plus supporting panels on the aside
2. low-schedule or enquiry-led programmes
   - empty state on the primary side
   - overview or enquiry notice plus supporting panels on the aside

This keeps the route family structurally consistent even when the operational truth changes.

## Handoff Rules

The route now follows these handoff rules:

- programme page explains fit, promise, and what support may include
- contact route owns the first practical enquiry step
- sessions hub stays visible as the public scheduled fallback
- safeguarding remains visible through the shell and trust surfaces

## Reusable State Contract

`selectProgrammeLinkedOpportunityNotice` now supports all four programme access branches:

- `live-session`
- `session-limited`
- `overview-only`
- `enquiry-only`

That means Prompt 22 and Prompt 23 can reuse the same state switch without rebuilding another route-local notice selector.
