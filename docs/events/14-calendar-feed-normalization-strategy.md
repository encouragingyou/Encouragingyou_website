# Prompt 14 - Calendar Feed Normalization Strategy

Prompt 14 moves calendar feeds from hand-maintained prototype assets to generated build outputs derived from canonical session data.

## Canonical workflow

Calendar artifacts are now generated from `site/src/content/sessions/*.json`.

The generation path is:

1. session facts in `src/content/sessions`
2. recurrence normalization in `src/lib/domain/session-schedule.js`
3. ICS serialization in `src/lib/domain/session-calendar.js`
4. file generation in `site/scripts/generate-session-calendars.mjs`
5. publish output in `site/public/calendar/*.ics`

The old `/source/blurpint/calendar` directory remains a reference input only. It is no longer copied into the production public directory.

## Generation rules

Each calendar feed is generated only when both conditions are true:

- `calendar.status === "available"`
- the schedule state is not `paused`, `cancelled`, or `contact-only`

If those conditions fail, no ICS document is emitted for that session.

## ICS normalization contract

Current generated files standardize the following fields:

- `PRODID:-//EncouragingYou//Sessions//EN`
- `METHOD:PUBLISH`
- `CALSCALE:GREGORIAN`
- stable `UID` from session content
- `X-WR-CALNAME` from the canonical session title
- `X-WR-TIMEZONE` from the schedule timezone
- `DTSTART` and `DTEND` from the first canonical occurrence
- `RRULE` from the normalized weekly schedule
- `SUMMARY`, `DESCRIPTION`, `LOCATION`, and `URL` from canonical content

Seasonal schedules may append an `UNTIL` fragment when a real season end is configured.

## Build and validation hooks

Calendar generation is now part of normal site workflows.

- `npm run calendar:generate` regenerates feeds directly
- `npm run build` regenerates feeds before Astro output
- `npm run dev` regenerates feeds before local development
- `site/src/data/generated/session-calendar-build-report.json` records the current generated outputs

The structured-content validator also enforces calendar consistency:

- the public path must match `/calendar/${slug}.ics`
- sessions marked `paused`, `cancelled`, or `contact-only` cannot pretend to have an available feed

## Maintenance rules

- Update session dates by editing session content only.
- Do not hand-edit files in `site/public/calendar/`.
- Keep `calendar.uid` stable so subscribed clients receive updates against the same logical item.
- Extend the same generator for future one-off events rather than introducing a second calendar pipeline.
