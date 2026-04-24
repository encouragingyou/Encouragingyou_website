# Prompt 38 - Future Consented Photography Handoff

## Launch Position

The launch site is illustration-led. It does not yet have approved documentary participant photography, testimonial photography, team headshots, or impact-proof gallery content.

Because of that:

- AI illustrations may support atmosphere, welcome, and narrative.
- AI illustrations may not stand in for documentary proof.
- Proof-bearing surfaces remain blocked until genuine approved assets exist.

## Canonical Metadata Fields For Future Photo Assets

Any future non-synthetic asset should be added to `site/src/content/mediaLibrary/default.json` with, at minimum:

- `sourceType`
- `participantRepresentation`
- `trustImpact`
- `evidenceUse`
- `consentStatus`
- `reviewCadence`
- `reviewExpiry`
- `safeguardingSensitivity`
- `replacementSourceType`
- `restrictedRouteFamilies`
- `preferredContexts`

## Approval Rules

Use `required-before-use` until all of the following are true:

- the asset source is known
- the intended route family is known
- consent scope covers that route family
- safeguarding review is complete where relevant
- alt text and caption needs are written
- expiry/re-review expectations are recorded if time-limited

Move to `approved-for-launch` only when the asset can stay live without a short-term re-review. Use `approved-time-limited` when reuse or visibility must expire on a date.

## Replacement Order

Replace in this order:

1. Homepage hero and other trust-sensitive hero imagery
2. About leadership/youth-led credibility imagery
3. Programme and session illustrations that currently sit near trust or reassurance copy
4. Involvement/editorial illustrations
5. Raster icon set once the vector redraw is ready

## Route-Family Rules

Future consented photography may be approved per route family. Do not assume approval is global.

High-risk route families that should require explicit review:

- safeguarding
- testimonials
- team/profile
- impact proof
- event recap evidence
- galleries

## Proof-Surface Gate

Do not unlock the following with synthetic stand-ins:

- gallery pages
- participant testimonials
- team headshots
- impact/evidence pages
- event recap proof

Those surfaces should launch only after the repo contains genuine approved media plus the related copy, captions, and consent evidence.
