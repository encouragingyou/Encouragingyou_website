# Prompt 24 - Live Offer Data And State Model

## Canonical Inputs

The sessions hub now reads from the same canonical inputs as the session-detail family:

- `site/src/content/sessions/cv-support.json`
- `site/src/content/sessions/youth-club.json`
- `site/src/lib/content/session-runtime.ts`
- `site/src/lib/domain/session-schedule.js`
- generated ICS files in `site/public/calendar`

The route does not reimplement dates in client-side DOM code.

## Route-Level Aggregate State

`site/src/lib/domain/session-hub-state.js` reduces the per-session temporal output into two route-level dimensions:

- `availability`
  - `available`: every published session is currently schedulable
  - `mixed`: at least one session is live and at least one is paused, contact-only, cancelled, seasonal-break, or missing dates
  - `unavailable`: no published session currently has a public next occurrence
- `calendarAvailability`
  - `available`: every published live session has a calendar file
  - `partial`: some do and some do not
  - `unavailable`: none do

That aggregate state drives the hero rail notice copy, not the individual session-card content.

## Session Card Contract

Each hub card now normalizes:

- recurrence label
- time-range label
- next session datetime when available
- status label or status message when not
- calendar action when available
- parent-programme bridge
- short expectation bullets
- one reassurance note

This keeps the card readable while still covering the practical information users need before opening the detail route.

## Explicit Fallback Rules

- If a session is live but the calendar file is missing, the card stays visible and points people to the detail/contact path instead of hiding the offer.
- If no sessions are publicly schedulable, the route-level rail drops to an availability warning and the contact route becomes the practical fallback.
- Venue detail remains enquiry-led unless a session explicitly moves to `public-address`.
- Because all state is rendered server-side, JS-disabled users still see the same next-step hierarchy and live-status text.

## Coverage

Prompt 24 adds direct unit coverage for the aggregate-state helper in:

- `site/tests/session-hub-state.test.mjs`

Browser-level route checks now live in:

- `site/tests/e2e/contracts/sessions-hub.spec.mjs`
- `site/tests/e2e/contracts/responsive-behavior.spec.mjs`
