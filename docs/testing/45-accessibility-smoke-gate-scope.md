# Prompt 45 - Accessibility Smoke Gate Scope

## What Prompt 45 Adds

Prompt 45 adds an automated accessibility smoke gate based on Axe:

- [site/tests/e2e/quality/accessibility-rules.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/quality/accessibility-rules.spec.mjs:1)
- [site/tests/e2e/support/accessibility.mjs](/Users/test/Code/new_website/site/tests/e2e/support/accessibility.mjs:1)

It complements the existing keyboard and landmark checks in [site/tests/e2e/contracts/accessibility-smoke.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/contracts/accessibility-smoke.spec.mjs:1).

## What The Smoke Gate Covers

Automated coverage now includes:

- serious and critical Axe violations on representative route families
- landmark-bearing, rendered browser output rather than raw source
- reduced-motion rendering during checks
- form-heavy, legal-heavy, and safeguarding-heavy routes in addition to the homepage

## What It Does Not Claim To Cover

This gate is not a full accessibility audit. It does not replace:

- screen reader testing
- keyboard flow review across every interaction state
- manual focus-order review across all breakpoints
- cognitive-content review
- real-device zoom and assistive-technology checks
- manual contrast validation beyond what automated rules catch reliably

## Why The Route Set Is Representative, Not Exhaustive

The selected routes intentionally cover distinct risk profiles:

- homepage
- multi-card overview
- form-heavy contact surface
- pathway hub
- safeguarding branch page
- legal/preferences route

That gives the automation broad route-family signal without forcing Axe across every low-variance route in the suite.

## Blocking Threshold

The smoke gate fails only on Axe violations with `serious` or `critical` impact.

That threshold is deliberate:

- it keeps the gate focused on meaningful blockers
- it reduces noise from lower-severity issues that still need manual review context
- it makes the gate stable enough to remain trusted in CI

## Expansion Rule

Add a route to the Axe smoke set only when it introduces:

- a new route family
- a materially different form or disclosure pattern
- a new trust-critical interaction surface

Do not add routes just to inflate route count. The goal is meaningful coverage, not a cosmetic total.
