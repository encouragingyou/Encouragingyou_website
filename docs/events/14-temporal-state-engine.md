# Prompt 14 - Temporal State Engine

Prompt 14 replaces the prototype's DOM-driven session math with a pure server-safe temporal engine.

## Runtime location

The engine is centered in `site/src/lib/domain/session-schedule.js`.

`site/src/lib/content/session-runtime.ts` exposes the same behavior to the Astro layer with a narrow typed surface:

- `getNextOccurrence(...)`
- `getTemporalState(...)`
- `buildEventSchema(...)`
- `buildCalendarDocument(...)`
- `getNextOccurrenceLabel(...)`
- `getTimeRangeLabel(...)`
- `getEndTimeLabel(...)`

## What the engine is responsible for

- normalizing weekly schedule inputs, including legacy fields still present in imported prototype data
- deriving first and next occurrences for recurring weekly sessions
- formatting time ranges and human-readable next-date labels
- producing truthful status labels and notices for paused, cancelled, contact-only, seasonal, and unavailable states
- handling Europe/London daylight-saving transitions without depending on browser DOM state

## Timezone strategy

All visible and machine-readable date work now uses the session timezone explicitly.

- `Intl.DateTimeFormat(..., { timeZone })` is used to read local calendar parts in `Europe/London`
- `zonedDateTimeToUtc(...)` converts local calendar dates plus local wall-clock times into UTC `Date` objects
- `formatIsoOffsetForTimeZone(...)` emits ISO datetimes with the correct local offset for JSON-LD

This preserves correct output across BST/GMT transitions for recurring Saturday sessions.

## Recurrence strategy

Launch schedules are modeled as normalized weekly recurrence:

- one or more `BYDAY` values via `schedule.byDay`
- optional `intervalWeeks`
- an anchor date in `schedule.startLocalDate`
- a local start time plus `durationMinutes`

`getNextWeeklyOccurrence(...)` searches forward from the current local calendar date, not from a fragile client-rendered assumption. The anchor date controls recurrence alignment rather than acting as a hard minimum bound for all future calculations.

## Derived state contract

`getSessionTemporalState(...)` is now the single place that decides what the UI can honestly say.

It returns:

- `state`
- `recurrenceLabel`
- `timeRangeLabel`
- `nextOccurrence`
- `nextDateLabel`
- `nextShortLabel`
- `nextDateTimeLabel`
- `nextLabel`
- `statusLabel`
- `statusMessage`
- `calendar.state`
- `calendar.href`

Routes and components consume this contract instead of re-deriving schedule logic ad hoc.

## Render timing

Prompt 14 intentionally moves the important time work to the server/build layer.

- session cards derive `timeLabel`, `nextLabel`, and schedule fallbacks in `site-content.ts`
- session detail routes derive badges, notices, calendar actions, and JSON-LD before HTML is emitted
- the browser enhancement layer no longer owns schedule truth

That keeps visible labels, machine-readable metadata, and downloadable files aligned from the same source.

## Current UI integration

The session engine now feeds:

- `site/src/components/ui/SessionSummaryCard.astro`
- `site/src/pages/sessions/index.astro`
- `site/src/pages/sessions/[slug].astro`
- `site/src/layouts/BaseLayout.astro`

Unavailable or non-live states now render as explicit notices or fallback labels instead of optimistic next-session messaging.
