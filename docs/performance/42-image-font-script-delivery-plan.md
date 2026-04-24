# Prompt 42 - Image Font Script Delivery Plan

## Canonical Sources

- `site/src/lib/media/delivery.js`
- `site/src/components/ui/MediaPicture.astro`
- `site/src/components/ui/MediaIcon.astro`
- `site/scripts/sync-media-assets.mjs`
- `site/src/layouts/BaseLayout.astro`
- `site/src/lib/legacy/bridge-manifest.js`

## Image Delivery

The launch site no longer relies on Astro’s generated image pipeline for public route media. Prompt 42 switched route rendering to the curated compatibility derivatives already defined in the media manifest:

- Illustrations render from `/images/*.avif` and `/images/*.webp`
- Icons render from `/icons/*.webp`
- The shared resolver is `site/src/lib/media/delivery.js`
- `MediaPicture.astro` now emits a normal `<picture>` with stable public `srcset` values
- `MediaIcon.astro` now emits a normal `<img>` pointing at the managed icon render

This removed the duplicate `dist/client/_astro/*.png|*.webp|*.avif` payloads that Astro was generating from the source masters. The build now keeps route media in the governed public directories only, and `validate-performance-budgets.mjs` fails if image assets reappear under `dist/client/_astro`.

## Loading Rules

- Above-the-fold illustrations stay eager with `fetchpriority="high"`
- All non-critical illustrations and icons stay lazy
- The fallback image source resolves to the manifest’s `defaultWidth`, not the largest derivative
- Layout dimensions come from the delivery contract so image rendering keeps a stable aspect ratio

Measured eager hero/media payload on sentinel routes:

- Home hero fallback: `/images/hero-1200.webp` at `85,718` bytes
- About hero/media fallback: `/images/about-960.webp` at `112,940` bytes
- Get Involved lead illustration fallback: `/images/volunteer-partner-1200.webp` at `87,388` bytes

## Font Delivery

The live font path is now owned by the app shell rather than the copied prototype asset bundle:

- Font file path: `/fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2`
- Source copy step: `site/scripts/sync-legacy-public.mjs`
- CSS reference: `site/src/styles/tokens.css`
- Head preload: `site/src/layouts/BaseLayout.astro`

The launch font baseline is one WOFF2 file at `33 KB` in source and `36 KB` in built client output. There is no second brand font download. The serif display stack remains system-resident.

## Script And Style Delivery

- Shared CSS stays as one compiled stylesheet: `/_astro/index.DPUW18_T.css`
- Shared JS stays as one compiled enhancement bundle: `/_astro/BaseLayout.astro_astro_type_script_index_0_lang.CQphUkpK.js`
- No prototype CSS or JS is shipped to `dist/client/assets`
- The launch baseline stays static-first: one stylesheet, one enhancement script, zero third-party runtime scripts

Measured compiled baseline:

- CSS: `89,231` raw bytes, `13,925` gzip bytes
- JS: `10,010` raw bytes, `3,689` gzip bytes

## Prototype Payload Cleanup

Prompt 42 retired the last public prototype runtime copies that were no longer used by live routes:

- `source/blurpint/assets/css/styles.css` is no longer copied into public output
- `source/blurpint/assets/js/site.js` is no longer copied into public output
- The remaining bridged legacy asset is the font directory only

That keeps the old prototype code available as reference input, but stops it from being silently deployable alongside the live site.
