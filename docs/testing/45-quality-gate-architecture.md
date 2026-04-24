# Prompt 45 - Quality Gate Architecture

## Objective

Prompt 45 turns the existing browser contract suite into a layered quality-gate system with clear ownership:

- structural and behavioral UI checks stay in Playwright
- first-party link integrity is validated by a preview-backed crawler
- rendered HTML is validated against a real markup ruleset
- accessibility smoke coverage is automated, but kept explicitly narrower than a full audit
- visual regression is limited to a small, stable baseline set

The resulting system is designed to fail early on high-signal regressions without turning routine UI work into snapshot churn.

## Layers

### 1. Build-time quality gates

These now run from the normal validation surface in [site/package.json](/Users/test/Code/new_website/site/package.json:1):

- `content:validate`
- `editorial:validate`
- `seo:validate`
- `discovery:validate`
- `perf:validate`
- `links:validate`
- `html:validate`

The new Prompt 45 validators sit after `build`, so they inspect the actual built runtime rather than source assumptions.

### 2. Playwright contract coverage

The existing suite under [site/tests/e2e/contracts](/Users/test/Code/new_website/site/tests/e2e/contracts) remains the main browser-facing safety net for:

- route rendering and shell structure
- responsive integrity
- resilience states
- legal and disclosure surfaces
- analytics boundaries
- form validation and success/error behavior
- navigation, breadcrumbs, and route-family relationships

These tests continue to prefer semantic locators and route-state assertions over DOM-path coupling.

### 3. Accessibility smoke layer

Prompt 45 adds automated Axe coverage in [site/tests/e2e/quality/accessibility-rules.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/quality/accessibility-rules.spec.mjs:1), backed by [site/tests/e2e/support/accessibility.mjs](/Users/test/Code/new_website/site/tests/e2e/support/accessibility.mjs:1).

Scope:

- serious and critical rule violations only
- representative route-family coverage
- reduced-motion rendering during checks

This gate is intentionally positioned as smoke coverage, not a replacement for manual accessibility review.

### 4. Visual regression layer

Prompt 45 adds targeted baselines in [site/tests/e2e/visual/route-visual-regression.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/visual/route-visual-regression.spec.mjs:1), with stabilization helpers in [site/tests/e2e/support/visual.mjs](/Users/test/Code/new_website/site/tests/e2e/support/visual.mjs:1).

The visual layer is deliberately narrow:

- homepage desktop shell
- homepage mobile shell
- contact validation state
- cookie notice
- 404 recovery page

Those scenarios cover the most valuable composition risk without snapshotting every route.

### 5. Full CI surface

The repo now exposes three practical validation entry points:

- `npm run validate`
  - non-Playwright quality gates plus build-backed link and markup checks
- `npm run test:e2e:quality`
  - accessibility smoke plus visual baselines
- `npm run ci`
  - `validate` plus the full Playwright suite

Because `ci` still owns the whole browser run, Prompt 46 can focus on deeper critical journeys instead of rebuilding cross-cutting quality infrastructure.

## Determinism Controls

The Prompt 45 gates rely on deterministic execution rules:

- built-preview validators run against `dist/server/entry.mjs`, not an ad hoc dev server
- visual tests force reduced motion and inject animation/transition suppression
- visual tests snapshot only stable routes or stable UI states
- accessibility smoke scans representative routes rather than every possible filtered state
- first-party link checks skip uncontrolled third-party destinations such as `mailto:`, `tel:`, or external hosts

## Failure Ownership

The architecture is designed so failures are easy to classify:

- `links:validate`
  - broken hrefs, missing anchors, missing first-party assets
- `html:validate`
  - invalid rendered markup in built route output
- `test:e2e:a11y`
  - serious or critical Axe violations
- `test:e2e:visual`
  - meaningful composition drift in pinned baseline routes/states
- `test:e2e`
  - broader behavioral, responsive, and route-contract regressions

## Prompt 46 Handoff

Prompt 46 should build on this system rather than duplicating it:

- keep using the existing contract/quality/visual separation
- add deeper multi-step journeys as flow tests
- rely on `validate` and the visual/accessibility gates as the stable foundation beneath those new flows
