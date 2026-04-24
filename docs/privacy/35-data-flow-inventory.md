# Prompt 35 - Data-Flow Inventory

## Scope

This inventory is limited to the live data-collection behavior implemented in `site/` after Prompts 33-35.
It does not describe future analytics, cookie banners, CRM tools, newsletter platforms, or case-management software that are not connected in the repo.

## Live collection routes

| Surface | Public routes and entry points | User-supplied data | System-captured data | Current purpose | Current storage/handling | Special handling |
| --- | --- | --- | --- | --- | --- | --- |
| `support-general` | `/`, `/contact/`, session journeys that hand off into `/contact/` | name, email, reason, message, optional updates choice | origin path, form id, render time, context id when present, hashed requester IP when available, user-agent, origin, referer | reply, route support, preserve session context | server-side `POST /api/enquiry/` writes JSON records into `ENQUIRY_STORAGE_DIR` / `var/enquiries` for manual handling | no payment, account, or address data collected |
| `involvement-general` | `/get-involved/` | name, email, reason, message, optional updates choice | same anti-abuse and request metadata as above | route into volunteer, partner, referral, supporter, or general involvement conversation | same secure enquiry storage and manual handling | privacy note must warn that safeguarding belongs elsewhere |
| `volunteer-enquiry` | `/volunteer/` | name, email, volunteer reason, message, optional updates choice | same anti-abuse and request metadata as above | volunteer first response and fair next-step handling | same secure enquiry storage and manual handling | no volunteer CRM or rota system connected at launch |
| `partner-enquiry` | `/partner/` | name, email, partner/referral reason, message, optional updates choice | same anti-abuse and request metadata as above | collaboration, referral, sponsorship, or partner follow-up | same secure enquiry storage and manual handling | no partner-management platform connected at launch |
| `safeguarding-concern` | `/safeguarding/`, `/safeguarding/child/`, `/safeguarding/adult/` | name, email, safeguarding reason, message | same anti-abuse and request metadata as above | review and route a non-emergency safeguarding concern | same secure enquiry storage and manual handling | separate route, no optional updates box, different retention/sharing caveats |

## Email fallback

Every live form still exposes `admin@encouragingyou.co.uk` as a fallback.
That route is public and deliberate.
It means the privacy notice must describe both secure-form handling and the possibility that someone chooses ordinary email instead.

## Current technical boundaries

Implemented now:

- server-side enquiry endpoint at `site/src/pages/api/enquiry.ts`
- validation and anti-abuse checks in `site/src/lib/server/enquiry-service.js` and `site/src/lib/state/support-form.js`
- route allowlists and session-context handoff in `site/src/lib/forms/enquiry-contract.js`
- point-of-collection privacy notes through `SupportForm.astro` plus `PrivacyNoticeCallout.astro`

Explicitly absent in the current build:

- non-essential analytics
- marketing or newsletter platform integration
- CRM or case-management integration
- interactive contact map on page load
- social-feed embeds on the core collection routes

## Change-control triggers

The canonical trigger list now lives in `site/src/content/privacyNotice/default.json`.
The privacy notice must be reviewed before release when any of the following happen:

- a new field is collected
- request metadata changes
- a processor is connected
- non-essential cookies or analytics are added
- a fixed retention schedule is approved
- the safeguarding intake or escalation path changes
