# Prompt 49 - Content Freeze and Change Control Rules

## Freeze Scope

The Prompt 49 freeze applies to:

- `site/src/content/**`
- `site/src/assets/media/**`
- `site/public/calendar/**`
- Legal notices, metadata, structured data, and disclosure text derived from the content layer

## Allowed Without Fresh Sign-Off

- Typo fixes that do not change meaning.
- Link corrections that do not change the destination type or trust posture.
- Metadata or CTA sync updates that only align duplicated text to an already approved source of truth.
- Schedule date/status updates that come from the canonical session model and do not change access rules.

## Changes That Require Explicit Owner Review

- Any new contact detail, including phone numbers or named inbox owners.
- Any safeguarding wording that adds named contacts, response promises, or procedural claims.
- Any new price, referral, eligibility, or access statement for sessions or programmes.
- Any legal or policy wording change affecting privacy, cookies, accessibility, analytics, or data handling.
- Any new partner logo, funder mark, testimonial, case study, or impact claim.
- Any replacement of AI artwork with real photography.
- Any change that expands geographic scope beyond the current Rochdale-centred description.

## Validation Required After Any Freeze Exception

Run from `site/`:

1. `npm run check --workspaces=false`
2. `npm run test:unit --workspaces=false`
3. `npm run ci --workspaces=false`

## Prompt 50 Focus

Prompt 50 should assume the editorial baseline is frozen and only reopen it for:

- A true factual defect.
- A release-blocking contradiction.
- An explicitly approved owner change on one of the go/no-go items logged in Prompt 49.
