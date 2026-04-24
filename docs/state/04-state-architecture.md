# State Architecture

Date: 2026-04-23

## Purpose

Prompt 04 defines where state lives, what owns it, and which parts of the new site need explicit orchestration versus native browser behavior.

The current site remains content-first. The chosen model is:

- no global client store
- server-derived route and content state where possible
- local component state for interactive UI
- pure domain utilities for recurrence, route matching, and form validation
- progressive enhancement for behavior that should still degrade safely without JavaScript

## Implemented state owners

### URL and server-derived state

| State | Owner | Canonical input | Current implementation |
| --- | --- | --- | --- |
| Active primary route | server render | `currentPath` plus nav hrefs | `site/src/lib/state/route-state.js` used by `site/src/components/site/SiteHeader.astro` |
| Homepage session timing labels | server render | session content JSON | `site/src/lib/domain/session-schedule.js` via `site/src/lib/content/site-content.ts` |
| Event structured-data timing | server render | session content JSON plus site settings | `site/src/lib/domain/session-schedule.js` via `site/src/lib/content/session-runtime.ts` |
| Empty / recovery state on missing routes | server render | route context | `site/src/pages/404.astro` plus `getNotFoundModel()` |

### Local interactive state

| State | Owner | Canonical input | Current implementation |
| --- | --- | --- | --- |
| Mobile menu open/closed state | local DOM state in header shell | viewport breakpoint and toggle events | `site/src/lib/client/site-behavior.js` on `SiteHeader.astro` |
| FAQ open/closed state | native browser `details[open]` state | user interaction per disclosure | `site/src/components/ui/FaqGroup.astro` |
| Support form field values | form controls | user input | native form controls enhanced by `site/src/lib/client/site-behavior.js` |
| Support form validation state | local form controller | normalized form payload | `site/src/lib/state/support-form.js` |
| Support form submission state | local form controller plus server endpoint | validated payload plus secure response state | `site/src/lib/client/site-behavior.js` with `site/src/pages/api/enquiry.ts` |
| Reduced-motion preference for scripted behavior | document-level local state | `prefers-reduced-motion` media query | `site/src/layouts/BaseLayout.astro` and `site/src/lib/client/site-behavior.js` |

### Deferred but already assigned

These states do not need active implementation yet, but prompt 04 assigns ownership now so later prompts do not invent ad hoc models.

| State | Future owner | Why |
| --- | --- | --- |
| Sessions / updates filtering and search | URL query state | Shareable, bookmarkable, and testable once listing routes exist |
| Consent preferences | persisted client state only if cookies/scripts require it | No banner or stored preference should exist before there is a real consent need |
| Rich form transport state | local form controller plus server endpoint | Prompt 33 now owns secure submission, redirect fallback, and abuse-defense handling |

## Key implementation decisions

### 1. No global store

The current route surface does not justify shared client memory. Every implemented state can be explained by one of:

- content JSON at render time
- the current URL
- a single interactive component boundary
- a pure utility driven from canonical inputs

Adding a global store now would create coordination cost without solving a real problem.

### 2. Derived time state moved out of DOM scripting

The legacy prototype computed session dates inside `source/blurpint/assets/js/site.js`. That logic is now extracted into:

- `site/src/lib/domain/session-schedule.js`
- `site/src/lib/content/session-runtime.ts`

This keeps recurrence rules, human labels, and schema output aligned from one source of truth.

### 3. Route state is now explicit

Primary navigation highlighting no longer depends on exact string equality inside the header component alone. `site/src/lib/state/route-state.js` normalizes paths and treats nested session/detail routes as active for their parent section.

### 4. Form behavior is progressive, not opaque

The support form now has an explicit state contract:

- idle
- invalid
- submitting
- success
- error

Validation stays pure and testable. Prompt 33 replaced the temporary `mailto` transport with a secure Astro endpoint while keeping the same client-side state names.

### 5. Native disclosure behavior stays native

FAQ items remain `details/summary` elements. That keeps disclosure state accessible and local. Prompt 04 intentionally does not replace this with custom accordion code.

## Files introduced or materially changed

- `site/src/lib/domain/session-schedule.js`
- `site/src/lib/state/route-state.js`
- `site/src/lib/state/support-form.js`
- `site/src/lib/client/site-behavior.js`
- `site/src/lib/content/session-runtime.ts`
- `site/src/lib/content/site-content.ts`
- `site/src/components/site/SiteHeader.astro`
- `site/src/components/forms/SupportForm.astro`
- `site/src/components/ui/FaqGroup.astro`
- `site/src/layouts/BaseLayout.astro`
- `site/src/styles/components.css`
- `site/tests/*.test.mjs`

## Verification surface

Automated state tests now cover:

- route matching behavior
- weekly recurrence and DST-sensitive session timing
- schema date formatting
- support-form normalization, validation, and secure submission metadata

Current command:

- `node --test tests/*.test.mjs` from `site/`

## Known limitations

- Prompt 33 now owns the secure server transport, so later prompts should treat `SupportForm` as a real server-backed surface.
- Only the homepage and 404 route are currently exercising the new behavior layer.
- There is still no browser-level end-to-end test harness; prompt 05 should build that next.
