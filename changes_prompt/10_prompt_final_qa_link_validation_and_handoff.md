# Prompt 10 - Final QA, Link Validation, And Handoff

You are implementing prompt 10 in `/Users/test/Code/new_website`. Read `changes_prompt/00_verified_materials.md` and all previous implementation notes first. Cross-check every link before writing the final handoff.

## Goal

Verify the complete client-change set end to end and leave a clear handoff explaining what changed, what was validated, and what remains unverified.

## Required QA Commands

Run from `/Users/test/Code/new_website/site` unless noted:

1. `npm run format:check`
2. `npm run lint:eslint`
3. `npm run check`
4. `npm run test:unit`
5. `npm run content:validate`
6. `npm run seo:validate`
7. `npm run discovery:generate`
8. `npm run discovery:validate`
9. `npm run build`

Then handle first-party link validation:

- Try `npm run links:validate`.
- If it still fails because `scripts/lib/preview-server.mjs` points at `dist/server/entry.mjs`, fix the validator or run an equivalent route/link validation against the actual built or dev output.
- Do not claim link validation passed unless every internal route and route-card/header/footer link has been checked.

## Browser QA

Start a local server and verify at minimum:

- `/`
- `/sessions/`
- `/sessions/cv-support/`
- `/sessions/youth-club/`
- `/programmes/`
- `/programmes/career-support-cv-help/`
- `/about/`
- `/get-involved/`
- `/contact/`
- `/safeguarding/`

Check viewports:

- 390 x 844
- 768 x 1024
- 1440 x 900

For each, verify:

- no overlapping text
- no horizontal scroll
- route cards/buttons are clickable
- menu opens and closes on mobile
- focus states are visible
- no console errors
- no unverified phone, venue, price, exact age range, testimonial, impact stat, or partner claim appears

## Handoff Requirements

Create or update a final note, preferably `docs/client-feedback/landing-page-client-change-handoff.md`, with:

- concise summary of the homepage change
- route/link inventory checked
- validation commands and results
- browser viewport checks and results
- known non-blocking limitations
- explicit pending item: exact youth age range still needs client confirmation if no verified source was supplied

## Acceptance Checks

- The homepage is compact and click-through based.
- The site still has accessible routes for all depth content.
- Tests and validation pass, or any failure is documented with exact cause and next action.
- No command session is left running.
- Final handoff does not include unchecked links.

