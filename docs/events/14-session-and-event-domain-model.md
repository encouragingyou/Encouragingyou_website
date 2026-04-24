# Prompt 14 - Session And Event Domain Model

Prompt 14 establishes one canonical model for recurring sessions, their derived occurrences, their downloadable calendar artifacts, and their structured-event outputs.

## Canonical source of truth

Launch session facts now live in `site/src/content/sessions/*.json`.

Each session record owns:

- stable identity and routing: `slug`, `route`, `title`, `shortTitle`
- descriptive event copy: `summary`, `eventDescription`, `audience`, `cta`
- schedule facts: `schedule.label`, `schedule.byDay`, `schedule.intervalWeeks`, `schedule.startLocalDate`, `schedule.startTime`, `schedule.durationMinutes`, `schedule.timezone`, `schedule.status`
- calendar facts: `calendar.publicPath`, `calendar.uid`, `calendar.status`
- venue facts: `location.locality`, optional venue details, and disclosure policy

`site/src/content/sessionPageContent/default.json` remains editorial-only. It can change headings, FAQs, and reassurance copy without becoming a second schedule source.

## Entity split

The repo now treats the session/event domain as five layers.

1. `SessionDefinition`
   The content-layer record in `src/content/sessions`.

2. `WeeklySchedule`
   The normalized recurrence facts consumed by the temporal engine.
   Required launch fields are `byDay`, `intervalWeeks`, `startLocalDate`, `startTime`, `durationMinutes`, and `timezone`.

3. `ScheduleStatus`
   Editorial or operational state attached to the schedule.
   Stored states are `active`, `paused`, `cancelled`, `seasonal`, and `contact-only`.
   Derived runtime states are `scheduled`, `seasonal-break`, and `dates-unavailable`.

4. `Occurrence`
   A pure derived object with concrete UTC `start` and `end` dates for the next visible session instance.
   Occurrences are never hand-authored.

5. Delivery adapters
   `session-calendar.js` produces ICS output.
   `buildSessionEventSchema(...)` produces Schema.org `Event` JSON-LD.
   `site-content.ts` converts the temporal state into card and detail-page view models.

## Responsibility boundaries

- Content collections own enduring facts and approved copy.
- `site/src/lib/domain/session-schedule.js` owns recurrence normalization, timezone math, and temporal state derivation.
- `site/src/lib/domain/session-calendar.js` owns ICS serialization only.
- `site/src/lib/content/session-runtime.ts` is the typed adapter boundary for Astro/runtime consumers.
- Templates only render already-derived labels, notices, actions, and structured data.

This keeps schedule truth out of client scripts and out of Astro page files.

## Launch status model

Prompt 14 formalizes the user-facing session states:

- `scheduled`: next occurrence is known and can be shown in UI and structured data
- `paused`: the recurring offer exists, but dates should not be presented as live
- `cancelled`: the offer is not currently running
- `contact-only`: the offer exists, but the next date must be given by the team
- `seasonal-break`: a seasonal offer exists outside its active window
- `dates-unavailable`: schedule facts are incomplete or no valid next occurrence can be derived

Every route, card, badge, calendar action, and JSON-LD block now consumes that shared state model.

## Future event support

The model is intentionally not session-only in shape.

- Schedule status is separated from page copy.
- Calendar metadata is separated from the recurrence engine.
- Location disclosure is separated from address storage.
- Structured data is generated from canonical inputs, not from session-page markup.

A future `events` collection can reuse the same schedule, calendar, status, and location contract without creating a second temporal architecture.
