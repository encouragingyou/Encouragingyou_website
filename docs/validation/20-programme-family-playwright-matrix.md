# Prompt 20 - Programme Family Playwright Matrix

Prompt 20 expands browser validation from generic route smoke coverage into a page-family contract around homepage entry, programme selection, detail-page truthfulness, and linked-route handoff.

## Added Or Expanded Suites

| File | Responsibility |
| --- | --- |
| `site/tests/e2e/contracts/community-friendship-route.spec.mjs` | dedicated Community & Friendship detail-page contract, including no-JS access to critical content |
| `site/tests/e2e/flows/core-journeys.spec.mjs` | homepage to programmes to Community & Friendship to Youth Club, About to Programmes to Community & Friendship breadcrumb return, and Community & Friendship to Contact |
| `site/tests/e2e/contracts/responsive-behavior.spec.mjs` | viewport-matrix check for the new programme-detail route |
| `site/tests/e2e/support/routes.mjs` | structural route contract for `/programmes/community-friendship/` |
| `site/tests/e2e/contracts/structural-integrity.spec.mjs` | enforces shell/title/H1 semantics for the new detail route through the shared core-route loop |

## User Flows Protected

- homepage support CTA path into the Programmes family
- programme-overview card entry into Community & Friendship
- About page onward routing into Programmes and the Community & Friendship detail page
- detail-page handoff into the linked Youth Club session
- detail-page handoff into the direct Contact route
- breadcrumb return from detail page back to Programmes

## Structural Assertions Protected

- valid shell/title/H1 contract on `/programmes/community-friendship/`
- breadcrumb presence and parent-route context
- disclosure visibility for generated illustration media
- visibility of the linked-opportunity notice
- visibility of FAQ and proof-boundary surfaces
- continued availability of both live-route and support-route actions
- no-JS access to critical detail-page content and actions

## Why This Is Not A Screenshot Suite

Prompt 20 keeps the same rule established in earlier prompts:

- assert user-visible outcomes
- prefer semantic selectors and stable route text
- use screenshots, traces, and videos only as failure diagnostics

The intent is to catch broken journeys and dishonest page states, not freeze incidental rendering details.

## Reuse Guidance For Prompts 21-23

Future programme-detail prompts should reuse this pattern:

1. add route-specific content through the canonical collections
2. extend the shared template only when the need is reusable
3. add one route-specific contract spec if the programme introduces distinct truth surfaces
4. expand `core-journeys.spec.mjs` only when the new route changes a real cross-page path
