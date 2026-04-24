# Prompt 32 - Service Area and Location Handling

## Public location truth

The public location anchor remains `Rochdale`.
Prompt 32 does not introduce:

- a full public postal address
- a staffed office model
- a public venue schedule
- an embedded live map

## Canonical location fields

`site/src/content/contactInfo/default.json` now carries:

- `serviceAreaLabel`
- `venueDisclosurePolicy`
- `mapEmbedAllowedAtLaunch`
- `locationGuidance.generalLocalityLabel`
- `locationGuidance.serviceAreaSummary`
- `locationGuidance.venueDisclosureSummary`
- `locationGuidance.mapAccessSummary`
- optional `locationGuidance.publicDirectionsLabel`
- optional `locationGuidance.publicDirectionsUrl`

This keeps service-area truth in one place instead of scattering it through route-local prose.

## Visibility rules

### Safe to publish now

- Rochdale as the public location anchor
- a clear service-area summary
- statement that exact venue details may be shared on enquiry
- statement that no interactive map loads on first arrival

### Still withheld

- exact venue or postal address
- phone-led arrival instructions
- any public directions link that has not been verified

## Route behavior

- Contact page renders location guidance as static content cards
- shell notice still reinforces the service-area / venue note
- `iframe` or map embed content is intentionally absent from the production route

## Future-ready extension point

If a verified public directions link is approved later:

- populate `locationGuidance.publicDirectionsLabel`
- populate `locationGuidance.publicDirectionsUrl`
- keep `mapEmbedAllowedAtLaunch` false unless policy changes

That would allow a low-risk external link before any decision about embedding.
