# Prompt 33 Validation And Abuse Defense Model

Date: 2026-04-23

## Validation Layers

### Client-side

`site/src/lib/client/site-behavior.js`

- trims and normalizes canonical fields
- enforces required-field, email-format, reason, and message-length rules
- focuses the first invalid field
- keeps inline error messages attached to the correct control

### Server-side

`site/src/lib/state/support-form.js`

- re-runs field validation
- validates surface ID against the allowlisted surface contract
- validates reason ID against the surface-specific allowlist
- validates origin path against the central surface origin map
- validates any enquiry context ID against the known session-context map
- rejects missing or invalid render timestamps

Client validation improves usability.
Server validation is the trust boundary.

## Abuse Defenses

### Method restriction

- only `POST /api/enquiry` is supported for state-changing submission
- `GET /api/enquiry` returns `405`

### Origin protection

`site/src/lib/server/enquiry-service.js`

- accepts same-origin `Origin`
- falls back to same-origin `Referer`
- only tolerates `sec-fetch-site` values compatible with same-site form posts

### Honeypot

`SupportForm.astro`

- hidden `website` field
- any non-empty value is treated as bot/spam traffic

### Timing friction

- hidden `renderedAt` timestamp is emitted at request time
- submissions that arrive too quickly after render are blocked
- this catches simple scripted posts that bypass visible interaction

### Rate limiting

- in-memory sliding window
- scoped by requester fingerprint plus surface ID
- current threshold: 20 attempts per 10 minutes
- conservative enough for public traffic while still leaving test and preview usage practical

### Minimal request metadata

- no raw IP storage in queue records
- hashed IP only
- no verbose request-body logging to console

## What Is Deliberately Not Collected

Prompt 33 keeps the launch data shape small.

Not collected:

- full postal address
- date of birth
- safeguarding disclosure detail inside the general enquiry form
- unnecessary free-text profiling fields
- partner/volunteer application-style long forms

Safeguarding-specific concern handling remains separate work for Prompt 34.
