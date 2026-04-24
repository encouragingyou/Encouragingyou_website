# Prompt 12 - Playwright Shell And Component Validation

## Goal

Prompt 12 expands Playwright from route-level safety checks into explicit shell and component-contract validation.

## What was added

### New preview-route coverage

File: `site/tests/e2e/contracts/component-system.spec.mjs`

Coverage:

- button loading, disabled, and current states
- selected card state
- success and error notice rendering
- expanded accordion state
- CTA band presence
- form-field error recovery on the real contact route

### Expanded shell validation

File: `site/tests/e2e/contracts/shell-wayfinding.spec.mjs`

Coverage:

- nested-route current-nav state for parent sections
- keyboard-visible focus on skip links and mobile navigation
- focus return to the menu toggle after Escape closes the mobile nav

### Expanded responsive validation

File: `site/tests/e2e/contracts/responsive-behavior.spec.mjs`

Coverage:

- `/system/components/` across the viewport matrix
- overflow protection and visibility checks for reusable component surfaces

## Supporting test helpers

File: `site/tests/e2e/support/assertions.mjs`

New helper:

- `assertVisibleFocusRing(locator)` for verifying focus visibility instead of only DOM focus position

## Harness route

Route:

- `/system/components/`

Purpose:

- deterministic component-state validation
- stable selectors for non-editorial states such as loading and selected
- regression protection when later prompts refactor page content

The route is intentionally marked `noindex,nofollow` and is not linked from the global navigation.

## Regression surface now protected

- shell open/close behavior on mobile
- shell current-route indicators
- breadcrumb continuity on nested routes
- disclosure expansion using the shared accordion primitive
- form validation visibility and recovery
- CTA availability on shared component surfaces
- component stability across mobile, tablet, laptop, desktop, and wide desktop

## Remaining gaps

- no visual diff layer yet; Prompt 45 is still the place for broader automated visual regression
- Prompt 33 now adds the real server-backed form success path on top of these shell/component guarantees
- placeholder child routes still use launch placeholder content, but their shell/component contracts are now protected
