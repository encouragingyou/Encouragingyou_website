# Prompt 03 - Make Navigation Match The Multi-Page Model

You are implementing prompt 03 in `/Users/test/Code/new_website`. Read `changes_prompt/00_verified_materials.md` first. Re-check internal routes before editing links.

## Goal

Make the site's navigation and landing-page click-through model feel intentional, similar to the verified reference site's multi-page structure, while keeping EncouragingYou's own routes and content.

## Files To Inspect First

- `site/src/content/navigation/default.json`
- `site/src/content/shellConfig/default.json`
- `site/src/components/site/SiteHeader.astro`
- `site/src/components/site/SiteFooter.astro`
- `site/src/lib/content/site-shell.ts`
- `site/src/content/pageDefinitions/launch.json`
- `site/tests/route-state.test.mjs`
- `site/tests/e2e/contracts/shell-wayfinding.spec.mjs`

## Implementation Requirements

1. Keep primary navigation linked to real pages, not homepage sections.
2. Consider whether the header should expose `Sessions` as a primary item because the client wants click-through navigation and sessions are a primary youth action.
3. If you add or reorder navigation items, keep the set concise. Do not duplicate every footer route in the header.
4. Keep `Safeguarding` visible in the main navigation or as a clearly visible global action because it is trust-critical in the verified source.
5. Ensure landing route cards and nav labels are plain and youth-readable:
   - `Sessions`
   - `CV help`
   - `Youth club`
   - `Programmes`
   - `About`
   - `Get involved`
   - `Contact`
   - `Safeguarding`
6. Footer groups should remain useful for depth and legal routes, but should not make the homepage feel like a dense business directory.
7. Update related tests if they assert the previous nav order.

## Link Verification Requirement

Before finishing, run a route verification script or equivalent that fetches each route referenced by header, footer, and homepage route cards from a local dev server. Record any failures and fix them.

## Acceptance Checks

- Every header, footer, and homepage route-card internal link returns HTTP 200 locally.
- No homepage route card uses a `#section` anchor for page-depth content.
- The menu works on desktop and mobile.
- Keyboard focus order remains logical: skip links, brand/nav, hero actions, route cards, footer.
- No external link is added unless it is checked live in the implementation turn.

