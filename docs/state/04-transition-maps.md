# Transition Maps

Date: 2026-04-23

## Mobile navigation

Owner:

- `site/src/lib/client/site-behavior.js`

State model:

| State | Meaning |
| --- | --- |
| `open` | Navigation panel is visible |
| `closed` | Navigation panel is hidden on mobile |

Transition table:

| Event | Condition | From | To | Side effects |
| --- | --- | --- | --- | --- |
| page boot | desktop viewport | any | `open` | hide menu button, show nav panel |
| page boot | mobile viewport | any | `closed` | show menu button, hide nav panel |
| toggle click | mobile | `closed` | `open` | set `aria-expanded=true`, label button `Close` |
| toggle click | mobile | `open` | `closed` | set `aria-expanded=false`, label button `Menu` |
| nav link click | mobile | `open` | `closed` | close panel after selection |
| `Escape` key | mobile | `open` | `closed` | close panel and return focus to toggle |
| viewport change | desktop | any | `open` | disable mobile-only hiding |
| viewport change | mobile | any | `closed` | reset to predictable collapsed state |

## FAQ disclosures

Owner:

- native `details/summary` behavior inside `site/src/components/ui/FaqGroup.astro`

State model:

| State | Meaning |
| --- | --- |
| closed | answer hidden |
| open | answer visible |

Transition table:

| Event | From | To | Side effects |
| --- | --- | --- | --- |
| summary activation | closed | open | browser sets `open` attribute |
| summary activation | open | closed | browser removes `open` attribute |

Why no custom machine:

- native disclosure already provides the correct accessibility semantics
- no cross-item coupling is required yet
- local per-item state is enough

## Support form

Owner:

- local form controller in `site/src/lib/client/site-behavior.js`
- pure validation and normalization in `site/src/lib/state/support-form.js`

State model:

| State | Meaning |
| --- | --- |
| `idle` | untouched or ready to submit |
| `invalid` | validation failed and field errors are shown |
| `submitting` | delivery flow is being posted |
| `success` | delivery step completed from the client’s perspective |
| `error` | delivery step failed and fallback guidance is shown |

Transition table:

| Event | Condition | From | To | Side effects |
| --- | --- | --- | --- | --- |
| field input/change | invalid field corrected | `invalid` or `error` | `idle` | clear field error and status banner |
| submit | payload invalid | `idle` | `invalid` | mark fields `aria-invalid`, show summary status |
| submit | payload valid | `idle` | `submitting` | disable button, change button label |
| delivery success | HTTP response ok and server queue write succeeds | `submitting` | `success` | reset form, show confirmation message with reference |
| delivery failure | HTTP response fails or server blocks/rejects the request | `submitting` | `error` | re-enable submit, show fallback guidance |

Current delivery branch:

- `http` via the shared Astro endpoint

Prompt 33 replaced the temporary transport without rewriting validation, field error handling, or state names.

## Session recurrence and event-schema derivation

Owner:

- `site/src/lib/domain/session-schedule.js`

State model:

| Derived value | Canonical inputs |
| --- | --- |
| next occurrence start/end | weekday index, start time, duration, timezone, current clock |
| human next-session label | next occurrence plus locale |
| time range copy | canonical start/end clock strings |
| schema `startDate` / `endDate` | next occurrence plus canonical timezone |

Derivation flow:

1. Read the current time.
2. Convert current time into the session timezone.
3. Determine the next matching calendar date for the configured weekday.
4. Convert the local civil start time back to UTC.
5. If the candidate start is already in the past, add seven days and repeat.
6. Derive end time from duration minutes.
7. Reuse the same computed window for visible labels and structured data.

Failure posture:

- no DOM query is required
- no page-specific selectors are involved
- test coverage includes DST-sensitive Europe/London behavior

## Reduced motion

Owner:

- document root data attribute set from `prefers-reduced-motion`

Transitions:

| Event | To | Side effects |
| --- | --- | --- |
| page boot with reduced motion enabled | `reduced` | root gets `data-motion="reduced"` |
| page boot with full motion allowed | `full` | root gets `data-motion="full"` |
| OS preference changes | matching value | root dataset updates for future scripted behavior |

Current use:

- the CSS layer already suppresses motion under reduced-motion preferences
- the document-level value exists so later prompts can make scripted motion decisions without inventing a new preference owner
