# Typography Strategy

Date: 2026-04-23
Prompt: `08 - Brand Token Source of Truth + Semantic Theme Architecture`

Reference inputs:

- `source/encouragingyou-site-look-and-feel.md`
- `source/blurpint/assets/css/styles.css`

Implementation files:

- `site/src/styles/tokens.css`
- `site/src/styles/theme.css`
- `site/src/styles/base.css`
- `site/src/styles/components.css`

## Decision

The production typography strategy keeps Atkinson Hyperlegible Next as the primary site font and uses a local editorial serif stack only as a selective display accent.

## Why this is the right compromise

The blueprint points toward a warmer editorial voice, but prompt 08 had to balance that against real implementation constraints:

- legibility for a youth-support and community-services site matters more than visual fashion
- privacy and performance both benefit from avoiding remote font delivery
- the repo already includes a self-hosted Atkinson Hyperlegible Next asset
- a local serif display stack can add warmth without adding a new network dependency or licensing problem

This gives the site a readable default voice first, then introduces warmth where it improves hierarchy rather than everywhere at once.

## Implemented font mapping

`site/src/styles/tokens.css` now defines:

- `--font-family-body`: `"Atkinson Hyperlegible Next", "Inter", "Segoe UI", system-ui, sans-serif`
- `--font-family-display`: `"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", serif`
- `--font-family-mono`: UI monospace fallback stack

`@font-face` is self-hosted and uses `font-display: swap`.

`site/src/styles/theme.css` then maps:

- `--theme-font-body`
- `--theme-font-display`
- `--theme-font-ui`

## Where each font is used

Default body and UI reading:

- body copy
- forms and controls
- navigation
- default heading styles in `base.css`

Selective editorial display use in `components.css`:

- section headings
- homepage hero headline
- feature-split heading blocks
- programme card titles
- empty-state titles
- detail-panel headings

This keeps the site grounded and readable in utility-heavy flows while still giving major narrative moments a warmer editorial note.

## Scale and readability rules

The type scale was rebuilt around `--font-size-00` through `--font-size-5` plus shared line-height and letter-spacing tokens.

Implementation rules now encoded in CSS:

- body copy stays on the accessible sans stack
- display serif is opt-in, not the default heading font everywhere
- headings use tighter line-height and controlled negative tracking
- prose and hero summary widths are capped with measure tokens instead of page-specific max-width guesses
- the font stack remains functional even if the self-hosted file fails to load

## Guidance for later prompts

- do not introduce remote font providers
- do not switch utility-heavy templates to the display serif by default
- if a future serif font is proposed, it should only replace the local fallback stack if it can be self-hosted cleanly and the gain is material
- keep readability-first typography as a product decision, not just an accessibility compliance checkbox
