# Prompt 25 - Career Pathway Playwright Matrix

Prompt 25 turns CV Support validation into a real programme-to-session contract instead of relying on generic route smoke tests.

## Added Or Expanded Suites

| File | Responsibility |
| --- | --- |
| `site/tests/e2e/contracts/cv-support-route.spec.mjs` | dedicated CV Support detail-route contract, including landmarks, truthful CTA checks, breadcrumb return, related-route return, calendar handoff, and no-JS access |
| `site/tests/e2e/contracts/responsive-behavior.spec.mjs` | viewport-matrix coverage for the richer session-detail family, including logistics headings and support-route visibility |
| `site/tests/e2e/contracts/shell-wayfinding.spec.mjs` | updated session-detail shell contract around the new locality wording and stable breadcrumb context |
| `site/tests/e2e/flows/core-journeys.spec.mjs` | existing homepage-to-programme-to-session and homepage-to-sessions-to-session flows continue to protect the wider ecosystem |

## User Flows Protected

- homepage to Programmes to Career Support & CV Help to CV Support
- homepage to Sessions hub to CV Support
- CV Support detail to calendar download
- CV Support detail to Contact
- CV Support detail breadcrumb return to Sessions
- CV Support detail related-link return to the wider Career Support programme

## Structural Guarantees Protected

- valid shell landmarks and document order
- single H1 on the session-detail route
- AI-art disclosure visibility on the live route
- visibility of timing, location, and bring-first logistics surfaces
- visible FAQ and working disclosure controls
- continued visibility of contact fallback and wider-programme bridge
- absence of empty testimonial/proof shells while proof assets remain unavailable

## Assertion Strategy

Prompt 25 keeps the browser layer intention-revealing:

- prefer headings, landmarks, links, and route text over screenshots
- assert real handoffs instead of only checking that buttons exist
- use no-JS mode where it protects route truth rather than as a ceremonial toggle
- keep responsive checks focused on actionable surfaces, not incidental pixel snapshots
