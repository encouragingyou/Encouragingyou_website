# Prompt 40 - Social Preview Asset Spec

Prompt 40 introduces a generated, route-family-based social preview system instead of reusing page illustrations as Open Graph fallbacks.

## Goals

- keep share images legible at small sizes
- stay on-brand without implying documentary photography
- avoid person-based proof claims on trust-sensitive routes
- let metadata inherit from a stable family asset instead of route-local image choices

## Canonical files

- config: `site/src/content/discovery/default.json`
- generator: `site/scripts/generate-social-preview-assets.mjs`
- manifest: `site/src/data/generated/social-preview-manifest.json`
- runtime lookup: `site/src/lib/content/social-preview.js`
- metadata integration: `site/src/lib/content/site-seo.ts`
- outputs: `site/public/social/*.png`

## Asset families

Current generated families:

- `home`
- `about`
- `programmes`
- `programme-detail`
- `sessions`
- `session-detail`
- `events-updates`
- `editorial-detail`
- `get-involved`
- `volunteer`
- `partner`
- `contact`
- `safeguarding`
- `legal`

Each family defines:

- eyebrow label
- headline
- supporting copy
- accent gradient pair
- mapped route families

## Visual rules

- 1200x630 PNG output
- abstract, typographic composition only
- no participant imagery
- brand strapline included
- explicit footer truth note: `Illustration-led launch site`

That footer note is deliberate. It keeps the share surface aligned with the launch-state truth model from Prompt 38 without forcing route-level disclosure copy into every preview.

## Metadata behavior

`site-seo.ts` now resolves share images in this order:

1. generated route-family preview asset
2. approved page media when no family asset exists
3. legacy default media fallback only if still allowed

For this prompt’s live route families, the generated preview asset is the expected source.

## Route-family mapping notes

- safeguarding gets its own non-photographic preview asset instead of inheriting a homepage illustration fallback
- legal/trust routes share a dedicated `legal` preview asset even though they remain `noindex`
- volunteer and partner have distinct preview families because their route intent differs materially from the hub

## Regeneration

- `npm run social:generate`

The script regenerates both PNG assets and the manifest used by the metadata helper.
