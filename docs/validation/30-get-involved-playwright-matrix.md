# Prompt 30 - Get Involved Playwright Matrix

Prompt 30 expands involvement coverage from hub-only validation to a hub-plus-detail family contract.

## Added or expanded suites

| File | Responsibility |
| --- | --- |
| `site/tests/e2e/contracts/volunteer-route.spec.mjs` | dedicated volunteer route contract, including trust surfaces, route handoffs, enquiry validation, and no-JS access |
| `site/tests/e2e/contracts/responsive-behavior.spec.mjs` | viewport-matrix coverage for the volunteer route alongside the wider route family |
| `site/tests/e2e/flows/core-journeys.spec.mjs` | homepage to Get Involved to Volunteer flow coverage |
| `site/tests/e2e/contracts/editorial-governance.spec.mjs` | updated privacy/helper-copy checks and removal of the old volunteer-placeholder assumption |

## User flows protected

- homepage CTA to Get Involved
- Get Involved hub to Volunteer With Us
- Volunteer route to Safeguarding
- Volunteer route to Privacy Notice
- Volunteer breadcrumb and return path back to Get Involved
- volunteer enquiry validation before any transport handoff

## Structural guarantees protected

- one real volunteer H1 instead of the old placeholder shell
- visible AI-art disclosure in the hero
- visible safeguarding and privacy cues near the enquiry path
- visible role-pathway, support, checks, and time-commitment sections
- absence of placeholder-status copy on the production volunteer route

## Assertion style

- prefer route text, headings, links, and form state over screenshots
- keep no-JS coverage where it protects route truth
- assert real handoffs between route families rather than only checking button existence
