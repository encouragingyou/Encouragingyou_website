# Prompt 35 - Point-of-Collection Notice Contract

## Objective

Every route that asks for personal information must show a short privacy explanation before submit and link directly to the full Privacy Notice.
The footer link is not enough on its own.

## Shared component contract

The reusable pattern is now:

- `site/src/components/forms/SupportForm.astro`
- `site/src/components/ui/PrivacyNoticeCallout.astro`

The callout appears before the form fields and renders:

- `privacyNoticeTitle`
- `privacyNote`
- `privacyHighlights[]`
- link to `/privacy/`

## Content source

Route-specific privacy microcopy is now controlled in `site/src/content/formSurfaces/default.json`.

Required fields:

- `privacyNote`
- `privacyHighlights`

Existing shared fields still apply:

- `intro`
- `messageHelper`
- `successMessage`
- `showUpdatesOptIn`

## Surface-specific rules

| Surface | Required emphasis |
| --- | --- |
| `support-general` | reply/routing purpose, separate updates opt-in, safeguarding route if safety is the real issue |
| `involvement-general` | involvement routing purpose, separate updates opt-in, no separate newsletter/CRM implied |
| `volunteer-enquiry` | volunteer-response purpose, separate updates opt-in, keep first-contact detail proportionate |
| `partner-enquiry` | collaboration/referral purpose, separate updates opt-in, safeguarding belongs elsewhere if needed |
| `safeguarding-concern` | non-emergency safeguarding use only, send only necessary detail, no updates opt-in |

## Implementation rules

- Do not hardcode privacy helper text directly in route templates.
- Add or edit form privacy microcopy in `formSurfaces/default.json`, then let `buildSupportFormModel()` in `site-content.ts` pass it through.
- If a new form surface is added, Prompt 35’s validator now expects a matching privacy collection-point entry in `site/src/content/privacyNotice/default.json`.
- If a route only links onward to Contact rather than collecting data itself, the point-of-collection obligation starts on the Contact form, not on the earlier route.

## Prompt 36 dependency boundary

Prompt 35 deliberately stops short of cookie-consent logic.
If Prompt 36 introduces any of the following, it must update both the full notice and the short-form point-of-collection explanation where relevant:

- non-essential analytics
- cookie preferences or consent storage
- external processors tied to enquiries or updates
- any new field that changes what the user is being asked to share
