# Prompt 31 - Partner Route Architecture

Prompt 31 replaces `/partner/` with a production involvement-detail route.

## Architecture decision

- Keep `/partner/` as a dedicated sibling to `/volunteer/` under the wider Get Involved family.
- Move the hub state for `Partner with us` from contact-led to route-ready, while keeping the actual enquiry handoff proportionate and low-friction.
- Let the page feel credible for schools, organisations, referrers, businesses, and funders without inventing logos, contracts, packages, or institutional proof that is not yet approved.

## Runtime composition

The route now depends on:

- `site/src/content/routePages/default.json` for hero copy, audience cards, collaboration pathways, credibility/proof sections, FAQ binding, and CTA structure
- `site/src/content/formSurfaces/default.json` for the partner-specific enquiry surface
- `site/src/content/faqs/default.json` for the dedicated partner FAQ group
- `site/src/content/involvementRoutes/default.json` for the route-ready hub state
- `site/src/lib/content/site-content.ts#getPartnerPageModel` for final model assembly
- `site/src/pages/partner/index.astro` for route composition

## Page structure

The route now renders in this order:

1. Hero with partnership promise, disclosure, and direct enquiry CTA
2. Audience-fit section for institutions, community organisations, and practical supporters
3. Collaboration-mode section for referrals, joint delivery, and practical support
4. Credibility section paired with an explicit proof-boundary panel
5. Process section for the first conversation and boundary-setting
6. FAQ, sidebar trust note, and partner enquiry form
7. Final CTA band back into the wider involvement family

## Reusable refinements

Prompt 31 adds one new shared component:

- `site/src/components/ui/ProofBoundaryPanel.astro`

That component now also replaces duplicated proof-boundary markup on `/about/`, so future routes can carry governed public-proof rules without re-implementing that pattern.
