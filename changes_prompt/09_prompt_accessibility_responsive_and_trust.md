# Prompt 09 - Accessibility, Responsive Layout, And Trust Boundaries

You are implementing prompt 09 in `/Users/test/Code/new_website`. Read `changes_prompt/00_verified_materials.md` first. Re-check all trust-critical links before finishing.

## Goal

Make the redesigned homepage and route pages accessible, mobile-safe, and trustworthy after the visual and content changes.

## Files To Inspect First

- `site/src/layouts/BaseLayout.astro`
- `site/src/components/site/SiteSkipLinks.astro`
- `site/src/components/site/SiteHeader.astro`
- `site/src/components/site/SiteFooter.astro`
- `site/src/components/ui/DisclosureNote.astro`
- `site/src/content/trustSignals/default.json`
- `site/src/content/privacyNotice/default.json`
- `site/src/content/safeguardingInfo/default.json`
- `site/src/styles/base.css`
- `site/src/styles/components.css`
- `site/tests/e2e/quality/accessibility-rules.spec.mjs`
- `site/tests/e2e/contracts/legal-disclosure-governance.spec.mjs`
- `site/tests/e2e/contracts/brand-asset-delivery.spec.mjs`

## Implementation Requirements

1. Check heading structure after homepage shortening. There must be one H1 and sensible H2/H3 order.
2. Ensure skip links still work.
3. Ensure all buttons and route cards have accessible names matching visible labels.
4. Keep AI illustration disclosure where synthetic people imagery could be mistaken for participant photography.
5. Keep safeguarding and privacy links visible near high-anxiety routes such as contact, sessions, and youth club.
6. Do not use colour alone to communicate important states.
7. Validate mobile viewports:
   - 390 x 844
   - 768 x 1024
   - 1440 x 900
8. Fix text overflow, clipping, overlap, and cramped tap targets.

## Trust Boundaries

Do not introduce:

- testimonials
- impact statistics
- partner logos
- public phone number
- public venue/address
- exact age range
- regulated care claims
- guaranteed job or interview outcomes

Unless a verified source is supplied and documented.

## Acceptance Checks

- Accessibility tests pass.
- No console errors during browser checks.
- The homepage and key click-through pages are readable and usable on mobile.
- Privacy and safeguarding links are still reachable from the homepage, contact, and footer.
- AI disclosure remains visible where required by current media policy.

