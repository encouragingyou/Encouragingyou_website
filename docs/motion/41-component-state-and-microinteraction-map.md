# Prompt 41 - Component State And Microinteraction Map

This document maps where motion is allowed and what state changes are now modeled explicitly.

## Shell and navigation

### Sticky header

State surface:

- `data-header-scrolled="false"`
- `data-header-scrolled="true"`

Behavior:

- shifts only background, border, and shadow
- does not change header height
- avoids layout shift while still signaling scroll position

### Mobile navigation

State surface:

- `data-nav-state="closed"`
- `data-nav-state="opening"`
- `data-nav-state="open"`
- `data-nav-state="closing"`

Behavior:

- uses structural opacity/translate transitions on the drawer panel
- keeps the menu toggle text and `aria-expanded` synchronized
- closes on outside click, link click, and `Escape`
- uses `inert` plus `aria-hidden` when the panel should not be interactive

## Hero and page-entry surfaces

### Homepage hero

Uses ordered reveal hooks on:

- eyebrow
- heading
- summary
- primary action cluster
- support rail
- badge list
- aside panel
- disclosure note

Rule:

- the content is always readable at first paint
- JS only adds a subtle settle for items below or entering the viewport

### Page intros

Uses ordered reveal hooks on:

- eyebrow
- heading
- summary
- badges
- action cluster
- optional media block

## Buttons and interactive links

State surface:

- default
- hover
- focus-visible
- pressed
- disabled
- loading
- current

Behavior:

- hover uses a restrained lift
- pressed removes that lift without adding bounce
- loading keeps the surface stable and avoids spinner theatrics

## Cards

### Shared card family

`CardPanel` now exposes:

- `data-motion="reveal emphasis"` for interactive cards
- `data-motion="reveal structural"` for non-interactive cards

Behavior:

- reveal is handled separately from hover emphasis
- hover changes border, shadow, background, and a small translate
- selected/current states remain durable and not animation-dependent

### Route families affected

- homepage quick actions and trust cards
- programme pillar cards
- session live rail cards
- editorial cards
- involvement pathway and role cards
- summary/support panels that inherit `CardPanel`

## Disclosure and FAQ surfaces

`AccordionGroup` now carries:

- `data-disclosure-state="expanded"`
- `data-disclosure-state="collapsed"`

Behavior:

- marker rotation and summary color are motion-safe
- the container surface changes between muted and open states
- the pattern stays native `<details>/<summary>` first

## Forms and submission feedback

### Support form

State surface:

- `data-form-state="idle"`
- `data-form-state="invalid"`
- `data-form-state="submitting"`
- `data-form-state="success"`
- `data-form-state="error"`

The status surface also carries:

- `data-visible="true"` or `false`
- `data-tone`
- `data-state`

### Fields

Each field wrapper now exposes:

- `data-field-state="default"`
- `data-field-state="filled"`
- `data-field-state="invalid"`
- `data-field-state="disabled"`

Behavior:

- filled fields get a durable visual confirmation without relying on focus
- invalid fields still lead with clarity, not animation
- controls transition only border/shadow/color properties

## Trust-heavy surfaces

Allowed:

- structural settle
- hover/focus clarity on links and buttons
- success/error confirmation on forms

Forbidden:

- playful lift on safeguarding guidance
- novelty movement on privacy, cookies, terms, accessibility, or urgent notices
- animation that competes with warnings, disclosures, or escalation language
