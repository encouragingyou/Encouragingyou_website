# Prompt 23 - Intergenerational State And Trust Governance

## Current State Choice

Community Support / Intergenerational Connection currently resolves to `enquiry-only`.

That remains the correct state because:

- the programme is public and launch-valid now
- the approved source material supports wider community support and occasional community events
- the repo does not have a verified standing timetable, session page, or care-service model for this pillar

Primary state ownership:

- `site/src/content/programmes/community-support-intergenerational-connection.json#existingDeliveryMode`
- `site/src/lib/domain/programme-route-state.js`
- `site/src/lib/content/site-content.ts#buildProgrammeStateModel`

## User-Visible State Surface

For this route, `enquiry-only` now drives:

- the `Enquiry-led route` state badge
- a route-specific enquiry notice in the delivery section
- a structured empty state instead of missing live content
- a primary `Contact the team` action
- visible `See current sessions` and `Get involved` alternatives
- a safeguarding escalation note in the CTA band

## Trust Rules

The route now keeps five trust boundaries explicit:

- the organisation stays youth-led even while the welcome expands across ages
- community events can be occasional without being hidden
- specific venue and access detail stay enquiry-led
- AI artwork stays disclosed as illustration rather than participant proof
- regulated care, home support, and specialist-service claims stay out

## Proof Governance

The new evidence notice defines what remains withheld:

- regulated care claims
- transport or home-visit promises
- named partner-referral pathways
- real-participant photography

The route therefore feels complete without manufacturing operational certainty.
