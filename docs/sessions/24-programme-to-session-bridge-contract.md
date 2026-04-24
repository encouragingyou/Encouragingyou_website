# Prompt 24 - Programme To Session Bridge Contract

## Core Rule

The sessions hub is now schedule-first, but it still exposes the wider support architecture on purpose.

The contract is:

- session hub explains live attendance options
- session detail pages explain operational specifics for one live route
- programme pages explain the broader support promise around those routes

None of those layers should collapse into the others.

## User-Facing Bridge Surfaces

The sessions hub now exposes the parent-programme relationship in three places:

1. intro actions
   - `See programmes` stays available as a lower-priority step back into the wider support architecture
2. session hub cards
   - each card includes an inline `Inside ...` bridge plus a `See programme` action
3. closing CTA band
   - visitors can step into `Contact the team`, `See programmes`, or `Read safeguarding` without losing the sessions context

## Boundary Rules

The bridge layer follows these rules:

- do not restory the full programme narrative on `/sessions/`
- do not make the wider programme route look like a timetable
- do not remove the parent-programme reference from live-session cards
- do not route anxious or unsure visitors into a dead end when a support conversation is the better first step

## Current Parent Mappings

At prompt 24 completion, the live mappings are:

- `CV support` -> `Career Support & CV Help`
- `Youth club` -> `Community & Friendship`

Those mappings are derived from canonical session `programmeIds`, not hardcoded in route markup.

## What Prompt 25 Should Reuse

When Prompt 25 rebuilds the CV Support detail route, it should preserve this bridge logic:

- the session-detail route can hand back to the parent programme
- the programme route remains the broader context layer
- the sessions hub remains the comparison-and-entry surface for live offers
