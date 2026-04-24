# Token System

Date: 2026-04-22
Prompt: `03 - Component Abstraction + Design System Extraction`

Primary code files:

- `site/src/styles/tokens.css`
- `site/src/styles/base.css`
- `site/src/styles/utilities.css`
- `site/src/styles/components.css`

## Working thesis

Visual thesis:

- warm editorial illustration, grounded community-centre realism, and soft layered surfaces that feel credible rather than corporate

Content plan:

- hero as the emotional front door
- support and session clarity as the first utility layer
- detail sections that deepen trust and programme meaning
- a final involvement CTA that converts without guilt-led pressure

Interaction thesis:

- a strong poster-style first viewport
- restrained hover lift and surface shifts on actionable elements
- smooth but subtle motion that disappears under `prefers-reduced-motion`

## Token extraction approach

The token system combines:

- the blueprint's core colour palette and spacing scale
- the strongest parts of the existing `source/blurpint/assets/css/styles.css`
- a simplified naming model suitable for reuse across Astro components

The implementation intentionally does not preserve the prototype CSS one-to-one. It normalizes the good parts into reusable layers.

## Token groups

### Colour

Implemented in `site/src/styles/tokens.css`:

- `--color-ink`: `#00405c`
- `--color-ink-strong`: `#1f2224`
- `--color-ink-soft`: softened body/meta text
- `--color-coral`: `#fc8c6c`
- `--color-coral-deep`: darker action/emphasis coral for contrast safety
- `--color-sage`: `#90b4a0`
- `--color-cream`: `#f8e8d0`
- `--color-sand`: `#e6d0b0`
- `--color-chalk`: `#f5f3ef`
- `--color-white`
- border, overlay, and surface tokens built from those base colours

Reasoning:

- core colours stay aligned to the blueprint
- surface tokens reduce the need to restyle every component from scratch
- derived line and overlay tokens make contrast and translucency consistent

### Typography

Implemented tokens:

- `--font-sans`: Atkinson Hyperlegible Next first, then Inter/system fallback
- `--font-serif`: Newsreader-style editorial serif fallback stack
- `--text-display`
- `--text-h1`
- `--text-h2`
- `--text-h3`
- `--text-body-lg`
- `--text-body`
- `--text-small`
- `--text-meta`

Reasoning:

- the prototype already uses Atkinson Hyperlegible Next, so the UI keeps that accessible baseline
- the serif stack is reserved for future editorial emphasis rather than applied indiscriminately
- the scale stays close to the blueprint while remaining practical for the current route work

### Spacing

Implemented tokens:

- `--space-1` through `--space-8`
- `--section-space`
- `--container`
- `--container-wide`

Reasoning:

- the spacing scale maps directly to the blueprint's rhythm
- container tokens separate page-shell constraints from component spacing

### Radius

Implemented tokens:

- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-xl`
- `--radius-pill`

Reasoning:

- major panels use 20px to 24px-style softness
- smaller UI uses subtler rounding
- pill radius supports CTAs, chips, and metadata labels

### Shadow and surface

Implemented tokens:

- `--shadow-soft`
- `--shadow-strong`
- `--surface-base`
- `--surface-soft`
- `--surface-sage`

Reasoning:

- shadows are restrained and only used to separate layered surfaces
- surface tokens are more important than individual box-shadow tweaks

### Motion

Implemented tokens:

- `--duration-fast`
- `--duration-base`
- `--easing-base`

Behavior rules:

- motion is limited to hover lift, background transitions, and subtle state changes
- `prefers-reduced-motion` reduces transitions globally

### Responsive foundation

Implemented breakpoint strategy:

- mobile-first default
- medium breakpoint at `48rem`
- large breakpoint at `64rem`

Reasoning:

- enough structure for the current sections without over-encoding breakpoints too early
- aligns with the future 4 / 6 / 12-column mindset from the blueprint

## Style-layer responsibilities

`tokens.css`

- raw design variables only

`base.css`

- reset, typography defaults, body background, focus states, skip link

`utilities.css`

- containers, sections, rows, generic list treatments

`components.css`

- shell, hero, cards, forms, split sections, breadcrumbs, empty states, footer, and route-level component styling

## Why this system is better than the prototype CSS

- shared shell and components no longer depend on copied selectors across standalone HTML files
- tokens are grouped by intent rather than by page
- later templates can reuse the same scales and surfaces without copying `source/blurpint` rules
- the system is specific enough to carry the brand, but small enough to stay maintainable
