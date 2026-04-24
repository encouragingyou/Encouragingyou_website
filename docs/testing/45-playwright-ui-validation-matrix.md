# Prompt 45 - Playwright UI Validation Matrix

## Existing Browser Layers

The repo already had broad browser contracts before Prompt 45. Those remain the main source of route and interaction coverage:

| Layer             | Main files                                                                                                             | Purpose                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Route contracts   | [site/tests/e2e/contracts](/Users/test/Code/new_website/site/tests/e2e/contracts)                                      | Route-family behavior, trust surfaces, forms, metadata, resilience, and legal states |
| Responsive matrix | [responsive-behavior.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/contracts/responsive-behavior.spec.mjs:1)   | Breakpoint integrity across mobile, tablet, laptop, desktop, and wide desktop        |
| Structural shell  | [structural-integrity.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/contracts/structural-integrity.spec.mjs:1) | Landmark, shell, and route-level document integrity                                  |
| Flow journeys     | [core-journeys.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/flows/core-journeys.spec.mjs:1)                   | Cross-route handoffs and critical public navigation                                  |

## Prompt 45 Additions

### Accessibility smoke

New file:

- [site/tests/e2e/quality/accessibility-rules.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/quality/accessibility-rules.spec.mjs:1)

Covered route families:

| Route                  | Why it is in the smoke set                                       |
| ---------------------- | ---------------------------------------------------------------- |
| `/`                    | Homepage composition, navigation, and high-traffic trust entry   |
| `/programmes/`         | Multi-card overview structure                                    |
| `/contact/`            | Form-heavy, trust-heavy route                                    |
| `/get-involved/`       | Pathway hub with multiple CTA bands                              |
| `/safeguarding/child/` | High-risk trust route with form, escalation, and policy surfaces |
| `/cookies/`            | Legal/trust route with preference controls                       |

Assertion policy:

- no Axe violations with `serious` or `critical` impact
- reduced-motion rendering during scan

### Visual regression

New file:

- [site/tests/e2e/visual/route-visual-regression.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/visual/route-visual-regression.spec.mjs:1)

Current baselines:

| Baseline         | State            | Why it matters                                       |
| ---------------- | ---------------- | ---------------------------------------------------- |
| Homepage desktop | default          | Main public impression and shell composition         |
| Homepage mobile  | default          | Highest-risk responsive visual surface               |
| Contact form     | validation-error | Trust-sensitive error state with form layout         |
| Cookie notice    | default          | Legal/trust content density and preference UI        |
| 404 page         | missing-route    | Fallback surface that must stay helpful and readable |

## Support Helpers

Prompt 45 adds two dedicated Playwright helpers:

- [site/tests/e2e/support/accessibility.mjs](/Users/test/Code/new_website/site/tests/e2e/support/accessibility.mjs:1)
  - wraps Axe scanning and formats blocking violations
- [site/tests/e2e/support/visual.mjs](/Users/test/Code/new_website/site/tests/e2e/support/visual.mjs:1)
  - normalizes reduced motion, viewport setup, and screenshot stabilization

## Commands

| Command                          | Scope                                      |
| -------------------------------- | ------------------------------------------ |
| `npm run test:e2e`               | Full browser suite                         |
| `npm run test:e2e:a11y`          | Accessibility smoke only                   |
| `npm run test:e2e:visual`        | Visual regression only                     |
| `npm run test:e2e:quality`       | Accessibility smoke plus visual regression |
| `npm run test:e2e:visual:update` | Approved baseline refresh                  |

## Expansion Rules

When a new route or route-state is added:

1. Add or extend a contract test if the behavior is route-specific.
2. Add responsive assertions if the route introduces a new composition pattern.
3. Add accessibility smoke coverage only if the route represents a new route family or a materially new interaction pattern.
4. Add a visual baseline only if the route introduces a stable, high-value composition that structural assertions would miss.

That keeps Playwright broad where it should be broad and selective where it should stay selective.
