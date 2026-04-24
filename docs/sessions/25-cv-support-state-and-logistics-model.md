# Prompt 25 - CV Support State And Logistics Model

## Truth Boundary

Prompt 25 keeps the session-detail route honest by splitting ownership cleanly:

- recurrence, next occurrence, calendar availability, and structured data stay in `site/src/lib/domain/session-schedule.js` and `site/src/lib/content/session-runtime.ts`
- route-specific wording and section order live in `site/src/content/sessionPageContent/default.json`
- final user-facing composition happens in `site/src/lib/content/site-content.ts`

The route therefore stays server-rendered and no-JS-safe without introducing a second schedule system.

## User-Visible States

The shared session-detail model now accounts for these states:

1. active session with next occurrence available
   - hero badges show recurrence, time window, and next date
   - at-a-glance timing card explains the live schedule
   - calendar action is visible
2. active session with calendar unavailable
   - calendar action is removed
   - schedule notice explains the missing calendar file
   - contact route remains visible
3. paused, cancelled, or contact-only session
   - temporal state removes next-date output
   - schedule notice explains the status honestly
   - enquiry-led routes remain visible
4. venue detail shared privately on enquiry
   - locality stays public
   - exact venue detail is never invented or overexposed
5. no-JS route access
   - hero actions, FAQ, breadcrumbs, and support routes stay reachable without client code
6. optional proof assets still absent
   - the route does not render empty testimonial shells or invented proof surfaces

## Logistics Surfaces

The operational detail route now carries logistics through deliberate surfaces rather than scattered copy:

- hero: immediate join and calendar actions
- at-a-glance band: timing, location handling, audience fit, and bring-first guidance
- support section: venue privacy, ask-first behavior, and safeguarding visibility
- sidebar: urgent help, wider programme bridge, and contact fallback
- CTA band: support route, broader programme route, sessions hub, and safeguarding note

## Hierarchy Rule

The parent programme still owns the wider promise.

The session page owns:

- exact Saturday timing
- next-occurrence rendering
- calendar-file availability
- what happens in the live session
- first-visit reassurance and practical logistics

That keeps the programme-to-session relationship coherent instead of letting the live route collapse back into a generic employability page.
