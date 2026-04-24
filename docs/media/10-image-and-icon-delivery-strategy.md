# Prompt 10 Image And Icon Delivery Strategy

Prompt 10 introduced two delivery modes because the repo needed both production-owned Astro delivery and stable compatibility outputs during the migration.

## Production-owned Astro routes

Production routes now consume media through:

- `site/src/lib/media/catalog.ts`
- `site/src/components/ui/MediaPicture.astro`
- `site/src/components/ui/MediaIcon.astro`

### Illustrations

- source: local master PNG in `site/src/assets/media/illustrations/`
- delivery: Astro `Picture`
- formats: `avif` and `webp`
- widths: taken from the manifest per asset family
- benefits:
  - intrinsic dimensions
  - automatic source-set generation
  - reduced layout shift risk
  - no hardcoded `/images/...` paths in route templates

### Icons

- source: local raster master PNG in `site/src/assets/media/icon-masters/`
- delivery: Astro `Image`
- format: `webp`
- size: fixed by the shared icon abstraction

## Why icons remain raster at launch

The supplied icon masters are approved as PNGs, not vectors.

Prompt 10 therefore chooses:

- production cleanup through manifest, imports, and shared abstraction now
- vector rebuild later, after the icon set is explicitly redrawn and approved

That is documented in each icon’s `replacementPriority` and `replacementNotes`.

This is a deliberate launch decision, not an oversight.

## Compatibility delivery for stable public asset paths

`site/scripts/sync-media-assets.mjs` also generates:

- `site/public/images/**`
- `site/public/icons/**`

Those files exist so any compatibility consumer that still expects `/images/**` or `/icons/**` keeps receiving outputs derived from the canonical masters.

The compatibility outputs are:

- regenerated on every build/dev sync
- described in the manifest
- validated by `site/scripts/validate-media-library.mjs`

## Validation strategy

### Build-time validation

`npm run media:validate` checks:

- canonical source files exist
- local master copies exist
- manifest dimensions match the canonical masters
- compatibility renders exist
- alt/disclosure rules are coherent
- no direct `/images/` or `/icons/` references remain inside production route/component code
- the legacy bridge manifest no longer treats `/images/` and `/icons/` as copied prototype directories

### Browser-level validation

`site/tests/e2e/contracts/media-delivery.spec.mjs` verifies:

- the homepage hero image loads
- AI illustration disclosure stays visible
- programme card illustrations load
- session icons load
- get-involved illustration and icon media load

## Migration proof completed in this prompt

Representative components and routes now consume the shared media system:

- `site/src/components/ui/ActionCard.astro`
- `site/src/components/ui/SessionSummaryCard.astro`
- `site/src/components/ui/ProgrammeCard.astro`
- `site/src/components/sections/HomeHero.astro`
- `site/src/components/sections/FeatureSplit.astro`
- `site/src/pages/get-involved/index.astro`

Later prompts can retire compatibility consumers route by route without changing the canonical media source chain.
