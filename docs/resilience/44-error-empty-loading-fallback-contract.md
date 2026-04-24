# Prompt 44 - Error Empty Loading Fallback Contract

## Source Of Truth

- Taxonomy and reusable surface copy: `site/src/content/resilienceStates/default.json`
- Runtime lookup: `site/src/lib/content/resilience-state.js`
- Route assembly: `site/src/lib/content/site-content.ts`
- Shared UI primitive: `site/src/components/ui/ResiliencePanel.astro`

## Rendering Rules

### Loading

- Only real user-triggered async work may use loading copy.
- Launch implementation: secure enquiry submission.
- Loading copy comes from `form-submitting`.

### Validation Error

- Field-level errors remain attached to the relevant control.
- A form-level status line also announces the shared summary state.
- Launch implementation: `form-validation-error`.

### Submission Error

- Errors never expose internal transport or origin-check details.
- Shared recovery message always points users to a retry plus the public email fallback.
- Specific form error surfaces:
  - `form-reload-required`
  - `form-context-expired`
  - `form-submission-error`
  - `form-rate-limited`

### Empty But Valid

- Empty states must explain why the surface is empty and where the live next step moved.
- Launch implementations:
  - `events-feed-empty`
  - `events-filter-empty`
  - existing programme-family empty states still render through the upgraded shared empty-state component

### Partial Content

- Use when detail is intentionally limited, not when the system is broken.
- Launch implementations:
  - `contact-launch-partial`
  - `contact-location-withheld`
  - `sessions-calendar-partial`
  - `sessions-calendar-unavailable`

### Unavailable Optional Enhancement

- The route must remain useful without the enhancement.
- Launch implementations:
  - `form-noscript`
  - `analytics-disabled`

### System Fallback

- Supporting media may fall back gracefully instead of crashing the route.
- Launch implementation: `MediaPicture.astro` and `MediaIcon.astro` now render `MediaFallback.astro` when a compatibility render cannot be resolved.

## Data Attributes For Validation

- `ResiliencePanel`: `data-resilience-state`, `data-resilience-presentation`
- Form status line: `data-resilience-state`
- Notice surfaces can carry `data-resilience-surface`
- Media fallback: `data-media-state="fallback"`

## Contracts By Layer

- Content: resilience surface ids are validated in `site/scripts/validate-structured-content.mjs`
- Templates: route pages consume shared models instead of hardcoded fallback strings
- Client behavior: `site/src/lib/client/site-behavior.js` maps form runtime states into taxonomy-aligned attributes
- Server feedback: `site/src/lib/forms/enquiry-feedback.js` resolves code-to-surface mapping centrally
