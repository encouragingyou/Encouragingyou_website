# Prompt 41 - Reduced Motion And Degradation Rules

Prompt 41 treats reduced motion as a first-class mode, not a late global kill switch.

## Runtime sources of truth

- `document.documentElement.dataset.motion`
- `document.documentElement.dataset.motionReady`
- `data-in-view` on reveal targets

The preference is set once inline in `BaseLayout.astro` and kept in sync in `site-behavior.js`.

## Reduced-motion policy

When motion is reduced:

- lift distance becomes `0px`
- press distance becomes `0px`
- reveal distance becomes `0px`
- drawer travel distance becomes `0px`
- reveal opacity floor becomes `1`
- semantic transition variables collapse to short color/shadow/opacity changes

That preserves feedback without forcing physical movement.

## No-JS behavior

The system does not hide content while waiting for JavaScript.

- reveal targets default to readable, fully present content
- `data-motion-ready` is only used to apply a subtle pending state to below-fold reveal targets after JS has booted
- if JS never runs, content remains visible and ordered

## In-view reveal rules

`data-motion="reveal"` is allowed only for calm orientation.

- initial viewport content is marked `data-in-view="true"` immediately
- below-fold content can settle in with a small offset only in full-motion mode
- reduced motion resolves reveal targets as fully visible with no travel

## Hover and pointer rules

The interaction model assumes hover is optional.

- hover lift is enhancement, not requirement
- focus-visible always carries the durable accessibility burden
- touch and coarse-pointer users still get clear state changes through color, shadow, and pressed/current states

## Trust-surface restrictions

The following surfaces must stay visually serious:

- safeguarding
- urgent help or escalation guidance
- privacy
- cookies
- accessibility statement
- terms and site policy
- disclosure or consent-aware legal notices

For these surfaces, only structural polish is allowed. No playful sequencing, bounce, or decorative motion should be added later without a deliberate design review.

## Performance guardrails

Prompt 41 keeps the motion layer compatible with Prompt 42.

- route transitions are intentionally rejected
- reveal logic uses a single intersection observer pattern and unobserves once complete
- transforms and opacity are used instead of layout-affecting animation
- header polish does not change block size
- mobile-nav animation does not require animation loops or long-running timers

## Regression checks

Current validation coverage includes:

- `npm run lint`
- `npm run check`
- `tests/e2e/contracts/motion-system.spec.mjs`
- full `npm run ci`

The focused browser contract checks:

- hover lift in full-motion mode
- sticky-header state changes
- mobile-nav state transitions
- reduced-motion parity
- disclosure state synchronization
