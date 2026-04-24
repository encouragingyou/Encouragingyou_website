# Prompt 24 - Sessions Hub Architecture

## Route Purpose

`/sessions/` now acts as the live-entry route for people who already want something concrete and time-bound.

It is intentionally not:

- a second programmes overview
- a generic story page
- a flat timetable dump

Its job is to let someone compare the currently published Saturday offers, understand what the next date means, and move into the right detail route or support route without friction.

Primary implementation:

- `site/src/pages/sessions/index.astro`
- `site/src/lib/content/site-content.ts#getSessionsIndexModel`
- `site/src/lib/domain/session-hub-state.js`

## Composition Order

The rebuilt route now renders in this order:

1. page intro
   - existing launch-safe H1 remains stable
   - top actions stay secondary to the live offers
   - a side rail shows the current route-level live state plus both published offers
2. live comparison section
   - each session now renders through a dedicated hub card
   - cards show next date, time window, core promise, reassurance, and the parent-programme bridge
3. practical reassurance section
   - keeps first-visit, venue, and support-escalation guidance visible before email is required
4. FAQ plus alternate-route notice
   - keeps first anxious questions public
   - keeps contact available when the live routes are not the right fit
5. closing CTA band
   - makes support, programme context, and safeguarding routes explicit without competing with the live cards above

## Reusable Additions

Prompt 24 adds two reusable session-family surfaces:

- `site/src/components/sections/SessionsLiveRail.astro`
- `site/src/components/ui/SessionHubCard.astro`

The live rail is the route-level state summary.
The hub card is the schedule-first comparison unit for any future session-list surface that needs more than the compact summary card.

## Shared Logic Boundary

Prompt 24 does not introduce a second schedule system.

Ownership stays split like this:

- session-level recurrence and next-occurrence logic: `site/src/lib/domain/session-schedule.js`
- route-level live aggregate state: `site/src/lib/domain/session-hub-state.js`
- route composition and copy assembly: `site/src/lib/content/site-content.ts`

That keeps the hub fully server-rendered and no-JS-safe while still making live-state behavior explicit and testable.
