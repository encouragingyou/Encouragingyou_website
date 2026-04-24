# Prompt 42 - Lab And Field Measurement Contract

## Canonical Sources

- `site/scripts/validate-performance-budgets.mjs`
- `site/src/lib/performance/policies.js`
- `site/tests/e2e/contracts/performance-delivery.spec.mjs`
- `site/src/data/generated/performance-budget-report.json`

## Lab Baseline

Prompt 42 introduces a two-layer measurement model.

### Build-time asset and route validation

- Command: `npm run perf:validate`
- Input: built `dist/` output plus the real standalone server
- Output: `site/src/data/generated/performance-budget-report.json`

The validator checks:

- shared CSS and JS size
- route-tier HTML size on sentinel routes
- font preload count
- eager image count
- absence of Astro-generated client media duplicates
- absence of copied prototype CSS and JS in deployable client output
- live `Cache-Control` headers on sentinel routes

### Browser delivery contract

- Contract test: `site/tests/e2e/contracts/performance-delivery.spec.mjs`

This protects the actual page markup and request shape:

- font preload comes from `/fonts/`
- hero media uses `/images/`
- icons use `/icons/`
- pages do not drift back to `/assets/css/styles.css`, `/assets/js/site.js`, or `/_astro/` image URLs

## CI Gate

The performance baseline is now part of `npm run validate` and therefore part of `npm run ci`.

Current launch gate sequence:

1. formatting
2. lint
3. `astro check`
4. unit tests
5. content and media validation
6. build
7. `perf:validate`
8. Playwright suite

This means performance regressions fail the same pipeline as content, metadata, and browser behavior regressions.

## Field Measurement Boundary For Prompt 43

Prompt 42 deliberately stops short of adding real-user analytics or third-party monitoring. The launch contract stays at:

- third-party runtime budget: `0`
- no analytics exemption
- no cookies or local storage budget reserved for measurement tooling

Prompt 43 can add privacy-conscious measurement only if it does all of the following:

- stays inside the shared JS budget or explicitly revises it
- keeps third-party allowance explicit rather than implied
- preserves the single-script, static-first loading model where practical
- updates `site/src/lib/performance/policies.js` and reruns `perf:validate`

## Representative Sentinels

The current regression sentinels are:

- `/`
- `/about/`
- `/programmes/`
- `/programmes/community-friendship/`
- `/sessions/`
- `/sessions/cv-support/`
- `/get-involved/`
- `/contact/`
- `/privacy/`
- `/events-updates/`
- `/events-updates/community-events-and-workshops/`

These are the routes Prompt 43 should keep using unless the public IA changes materially.
