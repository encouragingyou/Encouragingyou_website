# Prompt 20 - Linked Opportunity And State Model

## State Helper

Prompt 20 moved the truth-sensitive programme access branch into:

- `site/src/lib/domain/programme-route-state.js`

That helper is consumed by:

- `site/src/lib/content/site-content.ts#buildProgrammeStateModel`
- `site/src/lib/content/site-content.ts#getProgrammeDetailModel`

The move matters because programme pages now depend on linked live-opportunity truth, not static copy alone.

## Supported States

| State id | Meaning | Community & Friendship behavior |
| --- | --- | --- |
| `live-session` | a linked session has a current scheduled occurrence | show live-route badge, live notice, session card, session CTA, and contact fallback |
| `session-limited` | a linked session exists but no clear scheduled next occurrence is available | keep the linked route visible but switch to the fallback notice |
| `overview-only` | no linked recurring session exists yet, but the programme is public now | keep the page valuable through programme explanation and contact-only next steps |
| `enquiry-only` | the support direction is public, but access currently starts with conversation | use contact-first routing and omit live-session framing |

## Community & Friendship Current State

At prompt 20 completion, Community & Friendship resolves to `live-session` because:

- the programme record is `active-session-linked`
- the linked `youth-club` session currently has a scheduled recurring Saturday occurrence

That state drives:

- `Live Saturday route` badge language
- session summary inside the at-a-glance block
- the hero `See live route` action
- the route-specific active notice in the linked-opportunity section
- the CTA-band pairing of `See live route` plus `Contact the team`

## Opportunity-Handoff Rules

The route now follows these handoff rules:

- programme page explains fit, welcome, and reassurance
- session page owns timings, calendar file, and practical joining detail
- contact route remains available for people who want reassurance before attending
- venue detail stays public only at the locality level until a stronger publication policy exists

## Proof And Fallback Rules

Linked opportunity state is not the only honesty boundary.
The route also carries an explicit proof boundary:

- approved source material can explain welcome, belonging, and safe-space intent
- named participant stories, venue photography, and team-profile proof stay out until approved

This makes the route resilient even when supporting proof assets are still pending.

## Test Coverage

State logic is now directly tested in:

- `site/tests/programme-route-state.test.mjs`

That suite covers:

- active live-session selection
- session-limited fallback selection
- overview-only route selection
- enquiry-only route selection
- linked-opportunity notice switching

Route-level behavior is then exercised in browser tests through the Community & Friendship detail page and its handoffs into `Youth Club` and `Contact`.
