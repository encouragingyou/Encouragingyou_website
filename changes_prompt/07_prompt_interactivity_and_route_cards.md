# Prompt 07 - Add Useful Youth-Friendly Interactivity

You are implementing prompt 07 in `/Users/test/Code/new_website`. Read `changes_prompt/00_verified_materials.md` and inspect existing client behaviour before editing. Do not add interactive features that require unverified data.

## Goal

Make the site feel more engaging for young people through useful interactions around route choice, not through noise.

## Files To Inspect First

- `site/src/lib/client/site-behavior.js`
- `site/src/components/ui/ActionCard.astro`
- `site/src/components/ui/ButtonLink.astro`
- `site/src/components/sections/HomeHero.astro`
- `site/src/styles/utilities.css`
- `site/src/styles/components.css`
- `site/tests/e2e/contracts/motion-system.spec.mjs`
- `site/tests/e2e/contracts/responsive-behavior.spec.mjs`

## Implementation Requirements

1. Add or refine interactions that help route choice:
   - route cards lift or highlight on hover/focus
   - selected/focused states are clear
   - mobile menu feels responsive and clear
   - small reveal motion for hero and route cards
2. Keep motion restrained and respect `prefers-reduced-motion`.
3. Use existing `data-motion` conventions where possible.
4. Do not add carousels, auto-playing media, heavy social embeds, confetti, emojis, or distracting animations.
5. If adding JavaScript, keep it small and covered by existing behaviour patterns.
6. Route-card interactions must not change the link destination or block normal keyboard/screen-reader navigation.

## Acceptance Checks

- Route cards and buttons have visible hover, active, and keyboard focus states.
- Reduced motion mode removes or shortens motion appropriately.
- Mobile nav remains usable at 390px width.
- There is no layout shift when hovering route cards.
- E2E motion/responsive tests pass or are updated to the new intended behaviour.

