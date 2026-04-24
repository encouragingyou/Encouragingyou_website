# Prompt 12 - Component State Contracts

## Purpose

Prompt 12 formalizes which states are supported by the shared component layer and where that state is owned.

State should live in the smallest stable layer that can explain it:

- Route or content model for page ownership and current-route context
- Native HTML state for disclosure open/closed and disabled controls
- Client behavior only where real interaction requires it, such as mobile nav and live form validation

## Button contract

Components: `Button.astro`, `ButtonLink.astro`

Supported states:

- `default`
- `hover`
- `active`
- `focus-visible`
- `disabled`
- `loading`
- `current`

Ownership:

- Render props own `variant`, `current`, and initial disabled state.
- `site-behavior.js` owns submit-button loading state for `SupportForm`.

Implementation signals:

- `data-button-state="default|loading|disabled"`
- `aria-busy="true"` for loading buttons
- `aria-current="page"` for current action links
- `aria-disabled="true"` for disabled links

## Card/panel contract

Components: `CardPanel.astro`, `ActionCard.astro`, `SessionSummaryCard.astro`, `ProgrammeCard.astro`

Supported states:

- `default`
- `hover`
- `focus-visible`
- `selected`
- `current` only when the card is also a link and selection is route-derived

Ownership:

- Route or calling component decides `selected`.
- Hover/focus are purely presentational and token-driven.

Implementation signals:

- `data-card-state="default|selected"`
- `card-panel--interactive`
- `is-selected`

## Badge/meta contract

Components: `Badge.astro`, `BadgeRow.astro`

Supported states:

- `default`
- `selected`
- semantic tone shifts via `tone`

Ownership:

- Calling route chooses tone and `current`.

Implementation signals:

- `data-badge-state="default|selected"`

## Alert/notice contract

Component: `NoticeBlock.astro`

Supported states:

- `info`
- `important`
- `success`
- `error`

Ownership:

- Render props choose the tone.
- Live form status remains separate in `SupportForm` because it is transient and tied to submission flow.

Implementation signals:

- `data-tone`
- optional `role="alert|status|note"`

## Accordion contract

Components: `AccordionGroup.astro`, `FaqGroup.astro`

Supported states:

- `collapsed`
- `expanded`
- `focus-visible` on the summary trigger

Ownership:

- Native `details[open]` owns expansion state.
- No parallel JS disclosure store is allowed for the current FAQ pattern.

Implementation signals:

- `details[open]`
- `data-disclosure-group`
- `data-disclosure-item`

## Form-field contract

Components: `FormField.astro`, `CheckboxField.astro`, `SupportForm.astro`

Supported states:

- `default`
- `hover`
- `focus-visible`
- `disabled`
- `invalid`
- `submitting`
- `success`
- `error`

Ownership:

- Static field state can be expressed directly with `error`, `helper`, and `disabled` props.
- Live validation is owned by `site-behavior.js` and `support-form.js`.
- Validation rules are owned by `support-form.js`.

Implementation signals:

- `data-field-state="default|disabled|invalid"`
- `aria-invalid`
- `aria-describedby`
- `data-form-state="idle|invalid|submitting|success|error"`
- `data-form-status`

## Shell/navigation contract

Components: `SiteHeader.astro`, `ShellWayfinding.astro`

Supported states:

- `mobile nav open`
- `mobile nav closed`
- `current route`
- `focus return after dismiss`

Ownership:

- Route layout passes `currentPath`.
- `site-behavior.js` owns mobile-nav open/closed state.

Implementation signals:

- `data-nav-state`
- `aria-expanded`
- `aria-current="page"`

## Preview-route contract

Route: `/system/components/`

Purpose:

- render deterministic examples of loading, disabled, selected, success, error, expanded, and helper/error field states
- give Playwright one stable place to validate component contracts without depending only on editorial page combinations

Non-goal:

- the preview route is not a public marketing page and should stay out of navigation and search indexing
