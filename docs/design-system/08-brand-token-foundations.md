# Brand Token Foundations

Date: 2026-04-23
Prompt: `08 - Brand Token Source of Truth + Semantic Theme Architecture`

Primary source inputs:

- `source/encouragingyou-site-look-and-feel.md`
- `source/blurpint/assets/css/styles.css`
- `source/media_attachment/**`

Primary implementation files:

- `site/src/styles/tokens.css`
- `site/src/styles/theme.css`
- `site/src/styles/base.css`
- `site/src/styles/utilities.css`
- `site/src/styles/components.css`

## Purpose

Prompt 08 turns the visual blueprint into a durable token source of truth instead of continuing the prototype pattern of mixing brand constants, component decisions, and one-off overrides in the same CSS layer.

## Foundation taxonomy

`site/src/styles/tokens.css` now owns only foundation concerns:

- colour primitives
- RGB companions for alpha-based semantic tokens
- font families and weights
- type scale, line heights, and letter spacing
- spacing scale
- radii and border widths
- shadows
- readable measures and containers
- layout primitives for sections, hero spacing, panels, and cards
- motion duration, easing, lift, and blur values

## Colour decisions

The palette is deliberately split by responsibility:

- teal values carry trust, navigation, primary text, and primary actions
- slate values carry neutral reading copy and muted metadata
- coral values carry warmth, action emphasis, disclosure, and caution contexts
- sage values carry reassurance and supportive metadata
- cream, chalk, mist, and warm-white values carry layered surfaces and page atmosphere

Important correction made during implementation:

- the earlier lighter coral was acceptable for decorative use but too weak for small accent text on the light site background
- prompt 08 therefore added `--ref-color-coral-800` and remapped `--theme-text-accent` to that darker value instead of weakening readability

Spot checks used during implementation:

- accent text on chalk background: `5.26:1`
- accent text on white background: `5.83:1`
- body text on chalk background: `10.04:1`
- inverse text on the hero teal overlay: `15.81:1`

## Spatial and structural tokens

The old prototype spacing list has been replaced with a smaller set that is easier to reason about:

- `--space-2xs` through `--space-3xl`
- `--container` and `--container-wide`
- `--measure-prose`, `--measure-copy`, and `--measure-lede`
- `--section-space`
- `--layout-section-heading-space`
- `--layout-hero-*`
- `--layout-card-padding`
- `--layout-panel-padding`
- `--layout-split-gap`
- `--layout-support-gap`

This gives later prompts a consistent language for page shells, readable line length, and component padding without repeating arbitrary values.

## Shape, depth, and motion

Soft community-facing UI is now encoded explicitly:

- radii: `--radius-sm` through `--radius-xl`, plus `--radius-round`
- borders: `--border-width-thin` and `--border-width-accent`
- shadows: `--shadow-soft`, `--shadow-lifted`, `--shadow-focus`
- motion: `--motion-duration-fast`, `--motion-duration-base`, `--motion-duration-slow`, `--motion-ease-standard`, `--motion-ease-entry`, `--motion-lift-distance`

These are intentionally restrained. The site should feel warm and tactile, not glossy or app-like.

## Why this foundation is stable

- raw tokens no longer encode page-specific meaning
- accessibility-sensitive corrections now happen at the foundation/theme boundary instead of in late component overrides
- the naming system is broad enough for future pages without prebuilding speculative themes
- later prompts can extend the system by adding semantic aliases first instead of inventing more raw values
