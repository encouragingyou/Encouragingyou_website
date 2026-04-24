# Prompt 38 - Playwright Legal, Consent, and Disclosure Matrix

## Command Surface

- Focused trust suite: `npm run test:e2e:trust --workspaces=false`
- Full browser suite: `npm run test:e2e --workspaces=false`
- Full CI stack: `npm run ci --workspaces=false`

The trust suite is tag-driven via `@trust` so legal/disclosure regressions can run independently.

## New Spec Files

- `site/tests/e2e/contracts/legal-disclosure-governance.spec.mjs`
- `site/tests/e2e/contracts/legal-disclosure-responsive.spec.mjs`

## Governance Coverage

| Area | Protected behavior |
| --- | --- |
| Footer legal discoverability | Home footer exposes Privacy, Cookies, Accessibility, and Terms links with stable hrefs |
| Legal structural integrity | Privacy, Cookies, Accessibility, and Terms keep a single H1 plus stable shell landmarks and skip-link entry |
| No-banner cookie truth | No cookie dialog, accept/reject/customize UI, or consent persistence UI appears in the audited launch state |
| Disclosure placement | Prominent, compact, and sitewide AI-illustration variants appear on the correct route families |
| Non-JS fallback | Disclosure notes remain visible without client scripting |
| Reduced motion | Trust/legal entry points remain stable when `prefers-reduced-motion` is set |

## Selector Contract

Disclosure tests should prefer:

- `[data-disclosure]`
- `[data-disclosure-variant]`
- `[data-disclosure-context]`
- `[data-notice-id='ai-illustration']`

This avoids coupling future prompts to incidental text layout or CSS structure.

## Current Batch Expectations

- Home hero: prominent disclosure
- Home programme cards: compact disclosure
- About route: prominent disclosures on illustration-bearing surfaces
- Volunteer and Partner intros: prominent disclosure
- Editorial detail routes with AI imagery: detail disclosure
- Footer-wide shell: sitewide disclosure
