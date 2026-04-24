# Prompt 43 - Consent And Data Minimization Model

## Current Decision

The live build runs in `ANALYTICS_MODE=statistical`.

That means:

- the measurement layer is first-party;
- it is limited to aggregate service-improvement questions;
- it avoids advertising, profiling, and cross-site tracking;
- it is paired with clear information and a simple objection control on `/cookies/`.

This is intentionally different from a consent-banner model.

## Why The Site Still Has No Banner

Prompt 43 moves the cookie architecture from pure `no-banner / analytics absent` into a narrower `informational-notice / statistical analytics with objection` state.

The public boundary is:

- no advertising or remarketing cookies;
- no third-party analytics vendor at launch;
- no social-feed embeds or interactive maps on arrival;
- no analytics identifiers or local-storage preference center;
- one first-party objection cookie only when a visitor explicitly asks the site to keep analytics off for that browser.

## Active Preference States

### `active`

- default live state in `statistical` mode
- aggregate analytics can run
- no device identifier is created

### `objected`

- set by `/api/analytics-preference/`
- the objection is remembered in a first-party cookie
- client and server analytics both stop for that browser

### `browser-privacy-signal`

- driven by `Sec-GPC: 1` or `DNT: 1`
- treated as an objection
- no extra cookie is required

### `disabled`

- runtime-off state for environments where analytics must not run at all

## Future-Ready States

The runtime contract already reserves `ANALYTICS_MODE=consent` for any later provider or feature that falls outside the statistical-purpose boundary.

That future mode is expected to support:

- `pending`
- `accepted`
- `rejected`
- `withdrawn`

Prompt 43 does not activate those states in public UX, but the preference endpoint and state resolver are structured so Prompt 48 or later deployment work can switch modes without rewriting route templates.

## Data-Minimization Rules

### Allowed

- page IDs
- route families
- coarse same-origin source family
- coarse button surface classification
- calendar file slug
- form surface ID
- coarse validation category

### Disallowed

- names, email addresses, phone numbers
- message text or free text of any kind
- safeguarding reasons, concern summaries, or escalation details
- IP addresses, user agents, raw referrers, or query strings in stored analytics
- persistent visitor identifiers
- per-person journey reconstruction

## Sensitive Boundary

Safeguarding is excluded from analytics conversion measurement.

- no safeguarding page-view analytics
- no safeguarding form-start analytics
- no safeguarding form-submit analytics

General support and contact journeys are measured only at coarse surface level:

- page/family
- form surface
- validation category
- successful completion

## Failure And Degradation Rules

- analytics failure must never block rendering, navigation, or form submission;
- client delivery failures are swallowed silently;
- server-side analytics writes are best-effort and never block page or form responses;
- JavaScript-disabled browsing still records page views and calendar downloads through server-side hooks, but not CTA clicks or form-start/validation events;
- if analytics is objected or disabled, the client runtime does nothing and the server-side request hooks stop recording.
