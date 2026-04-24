# Prompt 09 Playwright Responsive Validation

Prompt 09 expands the prompt 05 Playwright foundation into a layout-regression contract that targets user-visible breakage rather than pixel snapshots.

## Suite additions

| File | Responsibility |
| --- | --- |
| `site/tests/e2e/contracts/structural-integrity.spec.mjs` | validates title, single H1, shell landmarks, and header-main-footer source order across core routes |
| `site/tests/e2e/contracts/responsive-behavior.spec.mjs` | validates viewport-specific shell reachability, CTA visibility, overflow, reading order, and key route resilience |
| `site/tests/e2e/support/assertions.mjs` | centralizes assertions for landmark order, sticky-header clearance, viewport visibility, navigation opening, and vertical order |
| `site/tests/e2e/support/viewports.mjs` | defines the verified viewport matrix |

## What the responsive suite protects

- primary navigation is reachable at every viewport
- home hero keeps the first-step CTA visible
- sessions hub keeps both recurring offers readable
- session detail pages keep intro CTAs and FAQ access intact
- get involved preserves card visibility, form reachability, and mobile reading order
- safeguarding keeps the escalation route obvious across breakpoints
- every protected route avoids horizontal overflow

## Structural rules

The structural suite intentionally checks semantics that later prompts could accidentally break:

- exactly one `h1` per route
- banner, primary navigation, main, and contentinfo landmarks remain present
- `header`, `main`, and `footer` remain in logical body order
- primary shell destinations resolve without 404s

## Failure artifacts

`site/playwright.config.mjs` now keeps:

- screenshots on failure
- videos on failure
- traces retained on failure

This matters because responsive regressions are usually easier to diagnose from actual renders than from assertion text alone.

## Contract philosophy

The suite is not a pixel-freeze.

It focuses on user-visible breakage:

- content hidden under the sticky shell
- primary actions pushed out of the initial viewport
- destructive overlap or sideways scroll
- navigation that exists in markup but cannot be reached
- route flows that technically load but stop being usable

That should stay true in later prompts. If a test starts blocking harmless refactors, the right fix is to tighten the contract around user outcomes, not to snapshot more pixels.
