# Homepage Trust Surface Integration

Prompt 17 makes trust a visible part of the homepage narrative instead of a late footer-only concern.

## Trust surfaces now on the route

- `HomeTrustStrip` keeps four distinct reassurance routes near the first decision point:
  - session safety / safe-space signal
  - organisational purpose
  - safeguarding route
  - privacy route
- `HomeHero` keeps the AI-art disclosure attached to the hero illustration.
- `ProgrammeCard`, `FeatureSplit`, and `HomePageTeaser` preserve media disclosures where AI-led illustrations are used.
- `HomeContactPanel` keeps urgent guidance, privacy wording, and the launch contact note visible next to the form.

## State-aware trust behavior

The homepage now consumes explicit trust-sensitive state rather than implying certainty:

- `stateSurface.liveSessions` controls whether the Saturday panel and live-session surface speak in available, paused, or unavailable terms.
- `stateSurface.updates` allows the homepage to stay truthful whether the public feed is empty or carrying a small set of real cards.
- `stateSurface.contact` keeps the launch contact note visible while phone and venue details remain unpublished.

## Content boundaries

Prompt 17 preserves the launch boundaries from Prompt 16:

- no invented testimonials
- no invented impact numbers
- no invented staff or founder biography detail
- no hidden safeguarding or privacy route

The homepage should feel credible because the route is honest and specific, not because it overclaims.

## Implementation files

- `site/src/components/sections/HomeTrustStrip.astro`
- `site/src/components/sections/HomeLiveSessionsSurface.astro`
- `site/src/components/sections/HomePageTeaser.astro`
- `site/src/components/sections/HomeUpdatesSurface.astro`
- `site/src/components/sections/HomeContactPanel.astro`
- `site/src/pages/index.astro`
