# Prompt 30 - Volunteer Route Architecture

Prompt 30 replaces `/volunteer/` with a production involvement-detail route.

## Architecture decision

- Keep `/volunteer/` as a dedicated route under the wider Get Involved family rather than folding volunteer detail back into `/get-involved/`.
- Separate volunteer truth from partner, referral, and general support routes so visitors do not have to decode mixed-intent copy.
- Reuse shared involvement primitives and the shared enquiry form contract instead of creating a volunteer-only one-off template.

## Runtime composition

The route now depends on:

- `site/src/content/routePages/default.json` for route composition, role pathways, support/check/time sections, FAQ binding, and CTA structure
- `site/src/content/formSurfaces/default.json` for the volunteer-specific enquiry surface
- `site/src/content/faqs/default.json` for the dedicated volunteer FAQ group
- `site/src/lib/content/site-content.ts#getVolunteerPageModel` for final model assembly
- `site/src/pages/volunteer/index.astro` for route composition

## Page structure

The route now renders in this order:

1. Hero with clear volunteer promise, media disclosure, and immediate actions
2. Role-pathway section explaining plausible ways people may help
3. Support and induction section
4. First-conversation process section
5. Safeguarding and checks section
6. Time-commitment section
7. FAQ, sidebar trust note, and volunteer enquiry form
8. Final CTA band back into the wider involvement ecosystem

## Reusable involvement family additions

Prompt 30 adds:

- `site/src/components/ui/InvolvementRoleCard.astro`
- `site/src/components/sections/InvolvementInfoSection.astro`

These are shared involvement-family primitives, not volunteer-only markup. Prompt 31 should reuse them for partner pathways, expectations, and trust notes rather than rebuilding the section system.
