# Stack Realization

Date: 2026-04-23

## Purpose

Prompt 06 turns the accepted Astro architecture into a real application root that can boot, build, and host both migrated and not-yet-migrated routes during cutover.

## Rehydrated decisions from ADR 01

Still binding:

- Astro remains the production runtime in `site/`
- static prerendering remains the default delivery model
- repo-local structured content remains the canonical source for Astro-owned routes
- progressive enhancement remains local and low-JS
- forms remain framework-owned, even if transport is still temporary
- `source/blurpint/` remains a migration source, not the long-term app root

Implementation details that prompt 06 had to add:

- actual Astro dependency and config surface
- public-asset bridge for prototype assets that are still needed
- explicit runtime handling for legacy HTML routes that still come from the prototype
- placeholder ownership for routes that exist in the structured model but never existed in the prototype
- Playwright alignment against the Astro runtime rather than the prototype preview

## What now exists

Application root:

- `site/` is now a real Astro app root

Core runtime files:

- `site/package.json`
- `site/package-lock.json`
- `site/astro.config.mjs`
- `site/tsconfig.json`
- `site/src/env.d.ts`

Operational scripts:

- `node ./scripts/sync-legacy-public.mjs`
- `node ./scripts/generate-route-parity-matrix.mjs`
- `npm run dev --workspaces=false`
- `npm run build --workspaces=false`
- `npm run preview --workspaces=false`
- `npm run check --workspaces=false`

## Route realization strategy

### Astro-owned now

These routes are rendered directly by the new runtime:

- `/`
- `/404/`
- `/programmes/`
- `/programmes/[slug]/`
- `/events-updates/`
- `/contact/`
- `/volunteer/`
- `/partner/`
- `/cookies/`
- `/accessibility/`
- `/terms/`

### Legacy-bridged through Astro

These routes still serve the prototype HTML, but they now do so as synced static HTML inside the Astro app:

- `/about/`
- `/sessions/`
- `/sessions/cv-support/`
- `/sessions/youth-club/`
- `/get-involved/`
- `/safeguarding/`
- `/privacy/`

Implementation:

- `site/src/lib/legacy/bridge-manifest.js`
- `site/scripts/sync-legacy-public.mjs`

This means the browser now enters through one application runtime even while some pages remain legacy-bridged.

## Public asset strategy

The new app does not yet own every asset.

Prompt 06 therefore introduces a controlled adoption path:

- copy prototype public assets into `site/public/`
- keep their source-of-truth state documented in the bridge manifest
- make the copy step explicit and repeatable

Current adopted assets:

- `/assets/**`
- `/calendar/**`
- `/favicon.svg`
- `/robots.txt`
- `/sitemap.xml`

Implementation:

- `site/scripts/sync-legacy-public.mjs`
- Prompt 10 later replaces prototype-derived `/images/**` and `/icons/**` copying with generated compatibility assets from canonical masters.

## Why this approach is safe

- It avoids parallel live apps.
- It avoids copying prototype HTML into Astro templates by hand before parity work starts.
- It lets future prompts replace routes one by one without breaking URLs.
- It keeps Playwright exercising the new runtime entry point during cutover.

## Commands verified in this prompt

From `site/`:

- `npm install --workspaces=false`
- `npm run sync:legacy --workspaces=false`
- `npm run routes:parity --workspaces=false`
- `npm run build --workspaces=false`
- `npm run check --workspaces=false`
- `npm run test:unit --workspaces=false`
- `npm run test:e2e --workspaces=false`

## Deferred to later prompts

- linting and formatting conventions beyond the minimum runtime surface
- final asset pipeline replacement
- full Astro implementations of the currently bridged prototype pages
- final legal, form-backend, consent, and SEO behavior
