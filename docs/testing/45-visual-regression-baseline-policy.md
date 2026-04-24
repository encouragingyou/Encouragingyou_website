# Prompt 45 - Visual Regression Baseline Policy

## Goal

The visual layer exists to catch meaningful layout or presentation drift on a small number of high-value, stable surfaces. It is not intended to become a screenshot archive of the whole site.

## Baseline Selection Rules

A route or state should receive a screenshot baseline only when all of the following are true:

- the route is high-value or trust-critical
- the composition is visually important enough that structural assertions would miss regressions
- the content is stable enough to avoid routine churn
- the state can be reproduced deterministically in automation

## Current Baselines

Stored under the default Playwright snapshot path beside the visual spec:

- [route-visual-regression.spec.mjs-snapshots](/Users/test/Code/new_website/site/tests/e2e/visual/route-visual-regression.spec.mjs-snapshots)

Current approved snapshots:

- `home-desktop-chromium-darwin.png`
- `home-mobile-chromium-darwin.png`
- `contact-form-validation-chromium-darwin.png`
- `cookies-page-chromium-darwin.png`
- `not-found-page-chromium-darwin.png`

## Stability Controls

Visual tests use [site/tests/e2e/support/visual.mjs](/Users/test/Code/new_website/site/tests/e2e/support/visual.mjs:1) to reduce noise:

- fixed viewport sizes
- reduced-motion emulation
- animation and transition suppression
- hidden caret
- explicit font readiness wait
- scroll reset before capture

## What Should Not Get Baselines

Do not add screenshot baselines for:

- routes dominated by volatile dates or time-sensitive labels unless the volatile region is isolated or masked
- every editorial detail page
- every legal page
- component states already protected adequately by semantic assertions
- pages where a screenshot would mostly duplicate the responsive matrix

## Review and Update Policy

Refresh baselines only when a UI change is intentional and approved:

```bash
npm run test:e2e:visual:update --workspaces=false
```

Review expectations:

- confirm the change is intentional, not incidental
- verify the diff still preserves readable hierarchy and trust surfaces
- avoid accepting baseline churn caused by animations, unstable content, or environment drift

## Choosing Screenshot vs Structural Assertions

Use a screenshot baseline when:

- spacing, grouping, or visual emphasis is the core risk

Use structural assertions when:

- the risk is route reachability
- the risk is heading/landmark correctness
- the risk is CTA availability
- the state is content-heavy but visually uninteresting

The policy intentionally biases toward structural assertions first and screenshots second.
