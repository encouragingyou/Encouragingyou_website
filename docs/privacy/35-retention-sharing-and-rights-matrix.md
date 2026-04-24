# Prompt 35 - Retention, Sharing, and Rights Matrix

## Retention approach at launch

The repo now publishes an honest launch position instead of pretending a fixed schedule exists.

- retention mode: `manual-review`
- public rule: do not keep records longer than needed for the purpose they were collected for
- internal implication: Prompt 36 or a later governance prompt can tighten this into a fixed schedule, but must update `site/src/content/privacyNotice/default.json` at the same time

## Route matrix

| Route family | Main sharing position | Retention position | Rights caveat |
| --- | --- | --- | --- |
| General support and contact | handled by the EncouragingYou team through site enquiry storage | review manually and delete when the conversation is complete unless an active service, safeguarding issue, or legal reason remains | access, correction, restriction, erasure, and objection routes should all stay available |
| Get involved hub | handled internally for volunteer, partner, referral, or supporter routing | same manual review approach as general support | direct-marketing style objection matters only if the updates opt-in was chosen |
| Volunteer | handled internally; no volunteer-management platform declared in the repo | review manually, then delete when no longer needed unless screening, safeguarding, or legal reasons remain | records may need limited retention if a screening or safeguarding issue emerges |
| Partner and referral | handled internally; no partner CRM declared in the repo | review manually, then delete when the collaboration or referral conversation is closed unless a live relationship, safeguarding issue, or legal reason remains | partner/referral records may need limited retention while an active case or relationship exists |
| Safeguarding concern | shared only as needed with the people responsible for reviewing or escalating the concern | no fixed public deletion window is published; retain as long as required for safeguarding handling and record-keeping duties | disclosure, deletion, or restriction requests may need a careful response where safety or legal duties still apply |

## Current system-status matrix

| System area | Current state | Public notice consequence |
| --- | --- | --- |
| Secure form endpoint | active | can truthfully say forms are handled server-side |
| Public email fallback | active | must mention that people may choose email instead of the form |
| Newsletter platform | not configured | the updates checkbox is recorded with the enquiry only |
| CRM / case-management platform | not configured | do not name or imply a CRM in the privacy notice |
| Analytics | absent | do not claim analytics, tracking, or consent logic yet |
| Non-essential cookies | absent | cookie notice remains intentionally narrow until Prompt 36 |
| Contact-page map embed | absent | do not imply map-provider data collection on first load |

## Rights wording guardrail

The public notice now uses plain-language rights wording:

- ask what information is still held
- ask for correction
- ask for deletion when data is no longer needed
- ask for restriction in appropriate cases
- object to optional updates
- complain to the ICO

The wording is intentionally cautious on safeguarding:

- no promise that every deletion request will be immediate
- no promise that every record can be fully disclosed while a concern is active
- no invented named DPO or specialist legal role

## Source alignment

Canonical source:

- `site/src/content/privacyNotice/default.json`

Supporting implementation:

- `site/src/lib/server/enquiry-service.js`
- `site/src/lib/forms/enquiry-contract.js`
- `site/src/content/formSurfaces/default.json`
- `site/src/content/contactInfo/default.json`
