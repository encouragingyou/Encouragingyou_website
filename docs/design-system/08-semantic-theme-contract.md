# Semantic Theme Contract

Date: 2026-04-23
Prompt: `08 - Brand Token Source of Truth + Semantic Theme Architecture`

Primary implementation files:

- `site/src/styles/theme.css`
- `site/src/styles/base.css`
- `site/src/styles/utilities.css`
- `site/src/styles/components.css`

## Layer contract

Prompt 08 formalizes the style architecture into five layers:

- `tokens.css`: raw foundation values only
- `theme.css`: semantic aliases plus reusable component-level aliases
- `base.css`: element defaults, global focus treatment, selection, and readable body defaults
- `utilities.css`: layout and rhythm helpers
- `components.css`: concrete shared UI selectors consuming semantic or component tokens

This is now the required extension order. New work should not jump from components straight back to raw foundation tokens unless the design language is genuinely missing a primitive.

## Semantic groups

`site/src/styles/theme.css` now owns the naming contract for:

- text roles: primary, strong, secondary, muted, accent, danger, inverse
- links: default, hover, underline treatment
- surfaces: page, banded sections, tinted sections, card, panel, glass, reassurance, caution, legal, disclosure
- borders: subtle, strong, inverse, success, caution, invalid
- focus and shadow behavior
- buttons: primary, secondary, surface, text, disabled, plus hover and active states
- form controls: default, hover, invalid, disabled, placeholder
- status messaging: success and error
- hero overlays and decorative gradients
- component aliases for header, cards, panels, strips, chips, disclosure, notices, footer, breadcrumbs, controls, and hero badges

## Proof of adoption

`site/src/styles/components.css` was fully rewritten to consume this contract.

Shared UI now routes through semantic tokens for:

- sticky header and navigation states
- brand mark and accent text
- all button variants
- homepage hero overlays, badges, and disclosure note
- action cards, programme cards, session cards, and trust cards
- feature split media shells
- support layout, support panel, statuses, and form controls
- FAQ disclosures
- breadcrumbs, empty states, detail panels, notices, and footer shells

There are no remaining `--color-*`, `--surface-*`, `--text-*`, legacy motion variables, or raw component-era RGBA values in the active style layers outside the foundation/theme files that are supposed to own them.

## Accessibility and state rules

Prompt 08 treats state visibility as part of the contract:

- accent text now uses a darker text-grade coral instead of the decorative coral tone
- focus remains globally visible through the shared focus ring in `base.css`
- form controls have distinct default, hover, invalid, and disabled tokens
- success and error notices use dedicated semantic surface and border pairings
- inverse hero text and overlay tokens preserve high contrast over imagery
- reduced-motion behavior remains global and opt-out-safe rather than component-by-component

## Extension rules for later prompts

- add or change foundation values in `tokens.css` only when the primitive set is genuinely incomplete
- add new meaning in `theme.css` before styling a new component directly
- prefer component aliases when a pattern appears in more than one shared selector
- avoid introducing page-only colours, shadows, or spacing unless the layout prompt proves they are needed globally
- if a visual tweak changes contrast or state visibility, update the semantic token rather than hiding the fix in a single selector
