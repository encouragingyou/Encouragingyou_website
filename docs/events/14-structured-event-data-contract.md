# Prompt 14 - Structured Event Data Contract

Prompt 14 makes event structured data a server-rendered output derived from canonical session facts.

## Source and render path

The JSON-LD path is now:

1. `src/content/sessions/*.json` for canonical event facts
2. `buildSessionEventSchema(...)` in `site/src/lib/domain/session-schedule.js`
3. session detail model assembly in `site/src/lib/content/site-content.ts`
4. `<script type="application/ld+json">` rendering in `site/src/layouts/BaseLayout.astro`

No client-side script is responsible for inventing event schema anymore.

## Eligibility rules

Structured event data is emitted only when the temporal engine can prove the session is currently schedulable.

Required conditions:

- temporal state is `scheduled`
- a concrete `nextOccurrence` exists
- canonical route, title, description, location, and image inputs are present

Paused, cancelled, contact-only, seasonal-break, or otherwise unavailable sessions do not emit optimistic `Event` schema.

## Current Schema.org shape

The runtime emits a single `Event` object with:

- `name`
- `description`
- `eventAttendanceMode`
- `eventStatus`
- `startDate`
- `endDate`
- `eventSchedule`
- `image`
- `url`
- `location`
- `organizer`

`eventSchedule` is derived from the same weekly recurrence inputs used for visible UI and ICS generation, so the public route, structured data, and calendar file all agree on cadence and timezone.

## Location disclosure rules

Prompt 14 also formalizes how venue privacy affects schema output.

- if `disclosurePolicy === "public-address"`, the venue name and street address can be emitted
- otherwise the schema falls back to locality-level place information only

That keeps structured data useful without leaking private or enquiry-only venue details.

## Integration expectations

Session detail pages should continue passing structured data through `BaseLayout`.

Future event and update routes should follow the same rule set:

- canonical content first
- temporal/state derivation second
- schema generation as an adapter step
- no client-only schema injection

This keeps search-facing metadata aligned with the same trustworthy source used for badges, notices, and calendar downloads.
