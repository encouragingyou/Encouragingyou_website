# Prompt 04 - Refresh The Visual System For A Youth Organisation

You are implementing prompt 04 in `/Users/test/Code/new_website`. Read `changes_prompt/00_verified_materials.md` and inspect the existing CSS before editing. Do not guess new brand colours or fonts without checking the source blueprint.

## Goal

Make the site feel more youth-facing, warm, and engaging without becoming childish, neon, cluttered, or inaccessible.

## Files To Inspect First

- `source/encouragingyou-site-look-and-feel.md`
- `site/src/styles/tokens.css`
- `site/src/styles/theme.css`
- `site/src/styles/components.css`
- `site/src/components/site/BrandMark.astro`
- `site/src/components/sections/HomeHero.astro`
- `site/src/components/ui/ButtonLink.astro`
- `site/src/components/ui/ActionCard.astro`

## Visual Direction To Use

Use verified palette direction already present in the source blueprint and existing tokens:

- Deep Teal `#00405C`
- Warm Coral `#FC8C6C`
- Soft Sage `#90B4A0`
- Warm Cream `#F8E8D0`
- Sand `#E6D0B0`
- Chalk `#F5F3EF`
- Charcoal `#1F2224`
- White `#FFFFFF`

The current site already has many of these tokens. Your job is to use them more confidently for a youth-led route hub and headings, not to introduce a random new theme.

## Implementation Requirements

1. Make homepage hierarchy stronger:
   - bolder H1
   - clearer route-card labels
   - more confident action buttons
   - less business-like panel language
2. Prefer friendly geometric and organic layout touches through spacing, colour blocking, and icon-led actions.
3. Keep text contrast accessible. Do not place white text on Warm Coral unless darkened enough to pass contrast.
4. Avoid emojis and gimmicks.
5. Avoid overusing cards. Use cards only for route choices or repeated items.
6. Keep radii professional and consistent with the existing system. Do not add huge pill/card shapes everywhere.
7. Respect reduced-motion preferences.
8. Use existing image and icon delivery via the media library. Do not hardcode unverified image paths unless the existing component pattern already does so.

## Acceptance Checks

- The homepage reads as youth-friendly and practical, not corporate.
- CSS still uses the established token system.
- Buttons and route cards have visible hover and focus states.
- Mobile layout has no overlapping text or oversized headings.
- `npm run content:validate` and `npm run test:unit` pass after any schema-sensitive changes.

