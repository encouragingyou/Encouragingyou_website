# Legacy Bridge Contract

Date: 2026-04-23

## Goal

Define exactly how `source/blurpint/` and `site/` interact during migration so the repo never ends up with competing truth across HTML, templates, structured content, and copied public assets.

## Core rules

### 1. `site/` is the runtime root

All future public serving, build validation, and browser QA should enter through `site/`.

`source/blurpint/` remains:

- a reference prototype
- a temporary legacy-route source
- a temporary asset source

It is no longer the primary runtime.

### 2. Structured content is canonical for Astro-owned routes

If a route is Astro-owned, its content must come from:

- `site/src/content/**`
- route-model helpers in `site/src/lib/content/**`

Do not copy facts from `source/blurpint/*.html` into new templates unless they are first normalized into the structured data layer.

### 3. Bridged legacy routes stay bridged, not forked

If a route is still served from prototype HTML, it must be served through the explicit bridge:

- `site/scripts/sync-legacy-public.mjs`
- `site/src/lib/legacy/bridge-manifest.js`

Do not create half-migrated duplicates of those pages in Astro before the dedicated page prompts arrive.

### 4. Copied public assets are derived outputs

Anything copied into `site/public/` from the prototype is a runtime convenience, not the canonical editable source.

Canonical source remains:

- `source/blurpint/**` until the asset pipeline replaces it
- then later `site/public/**` or generated outputs after prompt-specific cutover

### 5. Retirement must be checkpointed

A legacy route or asset can only be retired when:

1. the Astro replacement exists
2. Playwright covers the user-visible contract
3. the route parity matrix is updated
4. the cutover checklist item for that route is marked complete

## Bridge states

Allowed states:

- `adopt-unchanged`
- `normalize-and-migrate`
- `wrap-temporarily`
- `deprecate-later`
- `remove-after-parity-is-proven`

Interpretation:

- `adopt-unchanged`: copied or served as-is for now
- `normalize-and-migrate`: new Astro-owned route or feature fed from structured content
- `wrap-temporarily`: prototype HTML is still the served response, but only through the Astro runtime
- `deprecate-later`: still required in the runtime, but already slated for replacement
- `remove-after-parity-is-proven`: no replacement yet, but the path to deletion is explicit

## No-dual-truth rules by domain

| Domain | Allowed source during prompt 06 | Disallowed pattern |
| --- | --- | --- |
| Home page | Astro + structured content | editing `source/blurpint/index.html` to keep pace |
| Programmes routes | Astro + structured content | re-creating separate static HTML copies |
| Bridged legacy routes | prototype HTML through Astro public sync | partial Astro clones before the route prompt arrives |
| Session schedule logic | structured session content + runtime helpers | new inline JS date logic in copied HTML |
| Public prototype assets | synced from `source/blurpint/` | hand-editing the copied `site/public/` versions |
| Navigation and internal links | structured page definitions and navigation content | hardcoded route rewrites scattered through components |

## Bridge implementation files

- `site/src/lib/legacy/bridge-manifest.js`
- `site/scripts/sync-legacy-public.mjs`
- `site/scripts/generate-route-parity-matrix.mjs`

## Change protocol for future prompts

When replacing a bridged route:

1. build the Astro route in `site/src/pages/...`
2. move user-visible data sourcing to structured content
3. update Playwright expectations if visible behavior changes
4. remove the route from the legacy bridge manifest
5. regenerate the route parity matrix
6. update the cutover checklist and handoff note

When replacing an adopted asset group:

1. land the new asset pipeline or generated output
2. point Astro-owned routes to the new asset contract
3. confirm bridged routes no longer depend on the adopted group
4. remove or reclassify the asset entry in the bridge manifest
