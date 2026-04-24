# Prompt 25 - Session Family Responsive Checklist

Prompt 25 extends the session-family responsive contract around the richer detail layout introduced for CV Support.

## Required Surfaces At Every Supported Viewport

- one visible H1 above the fold with no sticky-header collision
- visible `Ask to join` action
- visible `Add to calendar` action when the calendar file is available
- visible at-a-glance timing and location cards
- visible contact fallback route
- visible FAQ entry points
- no horizontal overflow

## Narrow Mobile Expectations

- hero actions stay reachable without media overlap
- at-a-glance cards stack cleanly
- expectation and reassurance cards collapse into a readable single-column flow
- sidebar content falls below the main FAQ flow without losing the wider-programme bridge

## Wide Desktop Expectations

- at-a-glance cards read as a true comparison band rather than a long stack
- FAQ and sidebar surfaces stay visible as separate reading zones
- support-route and wider-route actions stay visible without scrolling into broken wrapping

## No-JS Expectations

- breadcrumb, hero actions, and FAQ remain usable
- session timing and venue-handling guidance remain server-rendered
- no route-critical disclosure depends on client-side state

## Reuse Rule For Prompt 26

Youth Club should inherit this checklist through the shared session-detail family.

Prompt 26 should only tighten youth-specific content and any genuinely missing family behavior; it should not fork the layout or weaken these responsive guarantees.
