# Playwright Validation Architecture

Date: 2026-04-23

Update after prompts 06 and 07:

- Playwright now defaults to the built Astro preview in `site/`.
- `preview:prototype` remains only as a legacy comparison tool.

## Purpose

Prompt 05 establishes the first browser-level quality gate for the site.

The current migrated app in `site/src/` is still source-only Astro code. It is not yet buildable or previewable as a runtime artifact. Because of that, the initial Playwright layer targets the static prototype under `source/blurpint/` while being designed to switch to the migrated runtime later without rewriting the suite.

## Runtime target strategy

Default browser target:

- `source/blurpint`

Future browser target:

- `site/dist` once the real app build exists
- or any explicit runtime provided via `PLAYWRIGHT_SITE_ROOT`

This is handled by:

- `site/scripts/serve-static-preview.mjs`

Root resolution order:

1. `PLAYWRIGHT_SITE_ROOT`
2. `site/dist`
3. `source/blurpint`

That means the test architecture is already migration-aware without pretending the new runtime exists yet.

## Test layers

### 1. Core journeys

File:

- `site/tests/e2e/flows/core-journeys.spec.mjs`

Current launch flows covered:

- Home -> Sessions -> CV support detail -> calendar and enquiry path
- Home -> Sessions -> Youth club detail -> calendar and enquiry path
- Home -> Get support anchor -> privacy visibility and form-validation feedback
- Home -> Get involved -> volunteer / partner / referral visibility
- Home -> Safeguarding -> escalation route visibility

### 2. Structural integrity

File:

- `site/tests/e2e/contracts/structural-integrity.spec.mjs`

Assertions:

- route loads successfully
- title is present and route-specific
- one H1 per page
- banner / primary nav / main / footer landmarks exist
- shell destinations resolve

### 3. Responsive behavior

File:

- `site/tests/e2e/contracts/responsive-behavior.spec.mjs`

Viewport matrix:

- mobile: `390x844`
- tablet: `834x1194`
- laptop: `1280x800`
- desktop: `1536x960`

Current responsive checks:

- no horizontal overflow
- core headings remain visible
- core CTAs remain reachable
- session cards remain reachable
- get-involved cards and form stay available

### 4. Accessibility and behavior smoke

File:

- `site/tests/e2e/contracts/accessibility-smoke.spec.mjs`

Current checks:

- skip link is keyboard reachable
- FAQ disclosures open from the keyboard
- reduced-motion mode still exposes core content
- browser validation feedback is triggered on the homepage support form

## Shared test architecture

Support files:

- `site/tests/e2e/support/fixtures.mjs`
- `site/tests/e2e/support/assertions.mjs`
- `site/tests/e2e/support/routes.mjs`
- `site/tests/e2e/support/viewports.mjs`

Design choices:

- ESM JavaScript instead of TypeScript to avoid introducing additional build dependencies before prompt 07
- one browser project: Chromium
- viewport matrix inside the suite, not a multiplied browser matrix
- console and page errors fail tests by default
- shared route contracts keep page assertions declarative

## Artifact strategy

Configured in:

- `site/playwright.config.mjs`

Artifacts:

- HTML report: `site/output/playwright/report`
- failure artifacts: `site/output/playwright/artifacts`

Failure capture policy:

- trace on first retry
- screenshots only on failure
- video retained on failure

## Quality-gate definition

Blocking now:

- core journeys
- structural integrity
- responsive overflow and reachability failures
- browser console or page errors

Advisory for later prompts:

- richer accessibility auditing
- visual regression snapshots
- broader route coverage once more templates exist
- validation of the migrated Astro runtime once it becomes buildable

## Commands

From `site/`:

- `npm run test:unit --workspaces=false`
- `npm run test:e2e --workspaces=false`
- `npm run test:e2e:headed --workspaces=false`
- `npm run preview:prototype --workspaces=false`

Direct binary fallback:

- `./node_modules/.bin/playwright test -c ./playwright.config.mjs`

To point the suite at a future built runtime:

- `PLAYWRIGHT_SITE_ROOT=./dist npm run test:e2e --workspaces=false`

## Known limitations

- The suite currently validates the prototype runtime because the new Astro app does not yet have a build/preview toolchain in-repo.
- No custom 404 route is tested yet because the prototype runtime does not expose one.
- Prompt 33 now extends the suite with secure submission, redirect fallback, and session-context enquiry coverage.
- In this environment, `npm` defaults into workspace mode, so the verified commands used `--workspaces=false` or the local Playwright binary directly.
