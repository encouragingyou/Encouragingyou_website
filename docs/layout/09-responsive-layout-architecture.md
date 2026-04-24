# Prompt 09 Responsive Layout Architecture

Prompt 09 turns the token and component groundwork from prompts 03 and 08 into a real layout engine that can survive page growth, route migration, and future content work without collapsing into homepage-only CSS.

## Architectural layers

1. Foundation sizing stays in `site/src/styles/tokens.css`.
   The prompt added layout-specific tokens for containers, grid minima, section rhythm, page-intro spacing, badge spacing, and header-height-aware hero sizing.
2. Semantic surfaces stay in `site/src/styles/theme.css`.
   New page-panel, page-media, badge, and callout aliases keep layout styling on the semantic side instead of reintroducing raw colors and shadows.
3. Low-level layout primitives live in `site/src/styles/utilities.css`.
   These utilities now define the reusable shells and composition patterns the routes rely on.
4. Route-facing shell selectors live in `site/src/styles/components.css`.
   This layer owns the page intro, hero, panels, disclosure areas, and short-viewport refinements.
5. Astro wrappers keep page markup consistent.
   `site/src/components/layout/PageSection.astro` and `site/src/components/layout/PageIntro.astro` encode the section-shell and intro-shell patterns so routes stop reimplementing them.

## Core primitives

| Primitive | Purpose | Main source |
| --- | --- | --- |
| `layout-shell`, `layout-shell--wide`, `layout-shell--narrow` | page-level width constraints | `site/src/styles/utilities.css` |
| `section`, `section--band`, `section--tint` | vertical rhythm and section tone | `site/src/styles/utilities.css` |
| `layout-stack` | predictable vertical spacing | `site/src/styles/utilities.css` |
| `layout-cluster`, `button-row` | wrapped inline grouping for actions and meta | `site/src/styles/utilities.css` |
| `layout-grid--cards`, `layout-grid--summary` | auto-fit card grids | `site/src/styles/utilities.css` |
| `layout-grid--sidebar` | content plus secondary rail | `site/src/styles/utilities.css` |
| `layout-grid--policy` | compact two-column information panels | `site/src/styles/utilities.css` |
| `layout-prose`, `layout-copy`, `layout-reading` | copy-length controls | `site/src/styles/utilities.css` |
| `PageSection` | Astro wrapper for section tone and shell width | `site/src/components/layout/PageSection.astro` |
| `PageIntro` | reusable intro shell with breadcrumbs, badges, actions, and optional media | `site/src/components/layout/PageIntro.astro` |

## Shared shell contract

- `site/src/layouts/BaseLayout.astro` remains the production shell owner.
- Source order is explicit: skip link, header, main, footer.
- `site-main` is now a named shell surface rather than an unstructured slot wrapper.
- Sticky navigation behavior still lives in `site/src/lib/client/site-behavior.js`; layout responsibility stays in CSS.
- Mobile navigation keeps working with and without JS.
  With JS disabled, the navigation remains present in source order.
  With JS enabled, the toggle only hides or reveals the existing panel.

## Route migration completed in this prompt

The responsive engine is proven on a representative route set instead of staying abstract.

| Route group | Why it matters | Outcome |
| --- | --- | --- |
| `/` | editorial hero, CTA stack, cards, support form | rebuilt around shared section and grid primitives |
| `/sessions/` | index page with schedule cards, guidance panels, FAQ rail | now Astro-owned and layout-driven |
| `/sessions/[slug]/` | dense intro with badges, CTAs, media, FAQ, related content | now Astro-owned and validated across viewports |
| `/get-involved/` | CTA-heavy information page with process panel and form | now Astro-owned and layout-driven |
| `/safeguarding/` | urgent guidance, split policy content, escalation CTA | now Astro-owned and layout-driven |
| `/programmes/`, `/programmes/[slug]/`, `/contact/` | route reuse of the new section and grid contracts | upgraded to the same shell vocabulary |

The bridge manifest in `site/src/lib/legacy/bridge-manifest.js` now treats `/sessions/`, `/sessions/[slug]/`, `/get-involved/`, and `/safeguarding/` as Astro-owned responsive-foundation routes instead of public-file bridges.

## Height-sensitive refinement

The viewport matrix exposed a real laptop-height issue at `1280x800`: primary CTAs on the homepage and session-detail intros were drifting below the fold even though width breakpoints looked correct.

Prompt 09 resolves that with a short-viewport desktop rule in `site/src/styles/components.css`:

- applies only at `min-width: 64rem` and `max-height: 52rem`
- trims intro padding and spacing
- slightly widens text columns relative to media
- reduces display sizing just enough to keep primary actions visible
- preserves the larger desktop composition at `1536x960` and `1728x1117`

That rule is intentionally narrow so later prompts can build larger pages without inheriting a shrunken desktop look.
