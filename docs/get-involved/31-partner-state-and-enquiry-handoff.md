# Prompt 31 - Partner State and Enquiry Handoff

The partner route is now route-ready, but still honestly enquiry-led.

## Visible state contract

- The Get Involved hub now treats `partner` as `route-ready` in `involvementRoutes.default.json`.
- The public page does not promise formal referral pipelines, partnership packages, response SLAs, or named partner rosters.
- Public proof is allowed to be absent because the route carries an explicit proof-boundary panel.
- Service-area language stays Rochdale-rooted and does not overstate broader geographic coverage.

## Enquiry handoff

The page now uses `formSurfaces.partner-enquiry` with:

- `defaultReasonId: "partner"`
- `allowedReasonIds: ["partner", "referral"]`
- partner-specific helper copy
- partner-specific submit label

That means a visitor can stay on the partner route for:

- collaboration or sponsorship interest
- practical support offers
- referral-shaped conversations that start from an institution or organisation

## Boundary rules

- Prompt 33 now replaces the old `mailto` transport across the shared enquiry system, while keeping the partner route low-pressure and enquiry-led.
- Safeguarding concerns are redirected by copy and linking, not silently merged into the partner flow.
- General support questions still have a visible exit into `/contact/`.
