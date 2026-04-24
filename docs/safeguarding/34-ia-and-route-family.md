# Prompt 34 - Safeguarding IA And Route Family

## Decision

Safeguarding is no longer one summary page.
The production route family is now:

- `/safeguarding/`
  - public hub
  - separates child and adult pathways immediately
  - hosts the shared secure safeguarding concern form
- `/safeguarding/child/`
  - route-specific child safeguarding guidance
  - keeps child risk language, reporting steps, and preparation notes together
- `/safeguarding/adult/`
  - route-specific adult safeguarding guidance
  - keeps adult risk language, reporting steps, and preparation notes together

## Canonical sources

- `site/src/content/safeguardingInfo/default.json`
  - emergency boundary
  - public concern-route truth
  - secure-form state
  - policy-publication state
  - training/vetting statement
  - proof boundary
  - child/adult branch content
- `site/src/content/routePages/default.json`
  - page-level metadata and H1/introduction copy for the hub and both detail routes
- `site/src/content/pageDefinitions/launch.json`
  - launch-page ownership for `safeguarding`, `safeguarding-child`, and `safeguarding-adult`
- `site/src/content/shellConfig/default.json`
  - safeguarding-family header CTA
  - breadcrumb parent rules for child/adult detail routes

## Runtime assembly

- `site/src/lib/domain/safeguarding-route-state.js`
  - derives public named-contact state
  - derives secure-form availability state
  - derives policy-publication state
  - keeps child/adult branch lookup explicit
- `site/src/lib/content/site-content.ts`
  - builds the hub model and branch-detail models from canonical content
- `site/src/pages/safeguarding/index.astro`
  - renders the hub route
- `site/src/pages/safeguarding/child/index.astro`
- `site/src/pages/safeguarding/adult/index.astro`
  - render the two detail routes through the shared template

## Shared UI

- `site/src/components/ui/SafeguardingRouteCard.astro`
  - hub-level route card for child/adult separation
- `site/src/components/ui/TrustStatusPanel.astro`
  - restrained trust/policy/status surface
- `site/src/components/sections/SafeguardingEscalationGuide.astro`
  - route-specific reporting steps, preparation list, and limitations
- `site/src/components/sections/SafeguardingDetailTemplate.astro`
  - shared branch-detail assembly

## Route-family rules

- the hub stays in primary navigation and footer/legal trust surfaces
- child/adult routes are not added as primary-nav items
- child/adult routes inherit the `Raise a concern` header CTA
- child/adult routes derive breadcrumbs from the safeguarding hub instead of behaving like isolated pages
- the serious UX comes from simpler hierarchy, restrained panels, and explicit emergency wording rather than extra illustration or conversion-style storytelling
