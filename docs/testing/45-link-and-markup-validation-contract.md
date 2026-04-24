# Prompt 45 - Link And Markup Validation Contract

## First-Party Link Validation

New script:

- [site/scripts/validate-first-party-links.mjs](/Users/test/Code/new_website/site/scripts/validate-first-party-links.mjs:1)

Shared runtime helper:

- [site/scripts/lib/preview-server.mjs](/Users/test/Code/new_website/site/scripts/lib/preview-server.mjs:1)

### Source of truth

The crawler uses [listRouteRecords()](/Users/test/Code/new_website/site/src/lib/content/discovery.js:102) from the discovery layer, so it validates the built public route inventory instead of a hand-maintained test list.

### What it checks

For rendered first-party pages, the script validates:

- canonical public routes render successfully
- internal `a[href]` targets resolve
- internal `link[href]` targets resolve
- internal `img[src]` and `img[srcset]` assets resolve
- internal `source[src]` and `source[srcset]` assets resolve
- internal `script[src]` assets resolve
- first-party `og:image` and `twitter:image` asset references resolve
- same-page and cross-page fragment identifiers point to real `id` targets

### What it skips

It intentionally skips:

- third-party hosts
- `mailto:`
- `tel:`
- `javascript:`

The gate is focused on first-party surfaces the repo controls directly.

## HTML / Markup Validation

New script:

- [site/scripts/validate-html-markup.mjs](/Users/test/Code/new_website/site/scripts/validate-html-markup.mjs:1)

Validator:

- `html-validate`

### What it validates

It fetches the built runtime through the preview helper and validates:

- all public route records from the discovery layer
- a dedicated missing-route request for the custom 404 experience

### Why it uses preview-backed HTML

The site runs with Astro server output, so validating only static files under `dist/client` would miss the server-rendered routes. Prompt 45 therefore validates rendered HTML from the built server entrypoint.

## Command Surface

New commands in [site/package.json](/Users/test/Code/new_website/site/package.json:1):

- `npm run links:validate`
- `npm run html:validate`

These are wired into `npm run validate`, which means broken first-party routes, missing assets, bad anchors, and invalid rendered markup now fail before the full Playwright run begins.

## Failure Semantics

The scripts are designed to produce actionable failures:

- route path and HTTP status for broken destinations
- source tag type for broken references
- fragment target for missing anchors
- route path plus rule/message for markup violations

This keeps the signal high enough to act on immediately during local development or CI.
