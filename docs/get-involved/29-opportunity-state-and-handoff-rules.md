# Prompt 29 - Opportunity State and Handoff Rules

Prompt 29 formalizes how the hub consumes shared state.

## Session-linked state

- The `Join a session` pathway uses the shared session-hub aggregate.
- When sessions are live, the card reports the live count.
- When availability is mixed or limited, the copy shifts to a softer contact-backed state instead of pretending the route is broken.

## Editorial opportunity state

- The hub does not maintain a second opportunity collection.
- The spotlight surface selects from the canonical editorial feed by using public, eligible `opportunity` items.
- If no public opportunity is live, the spotlight falls back to a calm empty state and keeps the contact route visible.

## Handoff boundaries

- `/sessions/` remains the source of truth for recurring Saturday support
- `/events-updates/` remains the source of truth for shareable public opportunity and update detail
- `/get-involved/` remains the source of truth for deciding which route to use next

## Launch honesty rules

- Partner has a dedicated route, but the actual handoff still stays proportionate and enquiry-led
- Supporter intent stays welcome even when there is no current public opportunity
- Referral visitors keep a direct contact path and safeguarding visibility
- No pathway should imply role, venue, or partnership detail that the repo does not yet support publicly
