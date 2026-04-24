# Prompt 09 Breakpoint Contract

Prompt 09 makes breakpoint behavior explicit in both CSS and Playwright instead of relying on accidental wrapping.

## Verified viewport matrix

| Name | Width | Height | Why it exists |
| --- | --- | --- | --- |
| mobile | 390 | 844 | narrow phone layout and menu toggle behavior |
| tablet | 834 | 1194 | two-column transitional layouts and disclosure stacking |
| laptop | 1280 | 800 | short desktop viewport that exposed fold regressions |
| desktop | 1536 | 960 | standard large-screen desktop layout |
| wide-desktop | 1728 | 1117 | wide shells and grid breathing room |

The source of truth for this matrix is `site/tests/e2e/support/viewports.mjs`.

## CSS breakpoint rules

### Base flow

- default styles are mobile-first
- all shells must work without media queries
- stacked flow is the fallback for navigation, page intros, forms, sidebars, and cards

### `min-width: 48rem`

- support layout becomes two-column
- sessions strip, programme grids, footer groups, and detail grids move to two columns
- `PageIntro` with media becomes a split layout rather than a single-column stack
- policy and summary content can start using wider measures without overflowing

### `min-width: 64rem`

- action, programme, and trust grids expand to three columns
- sessions strip stays on a controlled two-column card grid
- hero becomes a copy-plus-disclosure desktop composition
- `PageIntro` media layouts move to an even two-column split
- reversed feature splits and footer alignment become available

### `min-width: 64rem` and `max-height: 52rem`

- intro padding is reduced
- intro and hero gaps tighten
- display sizing comes down slightly
- text columns gain a little extra width relative to media
- media height is capped where needed so primary CTAs remain above the fold

This is a height guard, not a new visual theme. It exists because the laptop viewport is a real launch target and exposed failures the wider desktop layouts did not.

## Container and shell contract

| Token | Meaning |
| --- | --- |
| `--container` | default page shell width |
| `--container-wide` | wider shell for hero and high-emphasis sections |
| `--container-narrow` | narrower shell for more editorial or legal content |
| `--section-space` | default section rhythm |
| `--layout-page-intro-gap` | intro-shell spacing |
| `--layout-grid-gap` | default grid spacing |

Routes should consume these via `PageSection`, `layout-shell*`, and `layout-grid*` rather than inventing page-specific wrappers.

## Non-negotiable breakpoint behaviors

- no horizontal overflow at any verified viewport
- primary navigation must be reachable at every viewport
- the sticky header must not obscure the first main heading
- primary CTAs on core routes must remain meaningfully inside the initial viewport where the tests declare them critical
- layout adaptation should happen through CSS structure, not JavaScript-driven measurement
