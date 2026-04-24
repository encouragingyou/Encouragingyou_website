# Prompt 33 Contact And Enquiry Playwright Matrix

Date: 2026-04-23

## New Or Expanded Coverage

| File | Coverage |
| --- | --- |
| `site/tests/e2e/contracts/contact-enquiry.spec.mjs` | contact success, session-context handoff, spam-blocked state, no-JS redirect fallback |
| `site/tests/e2e/contracts/contact-route.spec.mjs` | secure no-JS form shell contract on Contact |
| `site/tests/e2e/contracts/volunteer-route.spec.mjs` | volunteer success state plus existing invalid-state coverage |
| `site/tests/e2e/contracts/partner-route.spec.mjs` | partner success state plus existing invalid-state coverage |
| `site/tests/e2e/contracts/cv-support-route.spec.mjs` | secure `Ask to join` routing for CV Support |
| `site/tests/e2e/contracts/youth-club-route.spec.mjs` | secure `Ask to join` routing for Youth Club |
| `site/tests/e2e/flows/core-journeys.spec.mjs` | home -> session detail -> secure contact handoff journeys |
| `site/tests/e2e/contracts/responsive-behavior.spec.mjs` | contact-form integrity across the viewport matrix |

## User Journeys Protected

- Home -> Contact -> valid secure submission
- Sessions -> session detail -> secure contact handoff
- Get Involved -> Volunteer -> valid secure submission
- Get Involved -> Partner -> valid secure submission
- invalid submission with field focus and inline errors
- no-JS submission with redirect fallback
- privacy and safeguarding visibility near the point of collection
- back-link and breadcrumb continuity after route handoffs

## Why This Prompt Uses Multiple Files

Prompt 33 expands an existing browser contract layer rather than replacing it.

- route-specific files still own route-specific assertions
- the new contact/enquiry file owns the cross-route secure-form behavior
- core journeys keep the first-step conversion paths honest
- responsive tests protect structural integrity at the shell/layout level
