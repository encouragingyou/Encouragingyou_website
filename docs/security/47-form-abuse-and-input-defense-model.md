# Prompt 47 - Form Abuse And Input Defense Model

## Priority surface

`/api/enquiry/` remains the highest-risk public write path. It now sits behind:

- same-origin request validation in the service layer
- request content-type allowlists
- request-size constraints
- hidden honeypot
- render-time minimum-age / future-skew checks
- in-memory rate limiting keyed by requester fingerprint plus surface
- server-side allowlists for surface id, origin path, context id, and reason id
- field length and email-shape validation

## Validation split

Client side:

- immediate guidance only
- field highlighting, focus management, and calm inline status updates
- no trust in hidden fields or client-generated route state

Server side:

- canonical normalization through `normalizeSupportFormPayload(...)`
- final route/surface/context allowlists
- final message/name/email/reason checks
- origin/referer/fetch-metadata trust decision in route-owned guards rather than the Astro global `checkOrigin` switch, because the standalone preview/runtime path must keep legitimate local submissions working
- storage write decision

## Request-shape rules introduced in Prompt 47

- `/api/enquiry/`
  - accepts only `application/x-www-form-urlencoded` and `multipart/form-data`
  - rejects bodies above 16 KB
- `/api/analytics/`
  - accepts only same-origin `application/json`
  - rejects bodies above 4 KB
- `/api/analytics-preference/`
  - accepts only same-origin `application/x-www-form-urlencoded`
  - rejects bodies above 2 KB

## Failure behavior

- user-facing enquiry errors remain calm and generic through the existing resilience copy
- suspicious or malformed analytics/preference traffic gets minimal `403`, `413`, or `415` responses with no stack details
- API responses stay `no-store`
- the browser never receives backend path details, secret names, or storage implementation detail

## Proportionate access posture

- The site still supports JavaScript-disabled form submission via redirect fallback.
- Anti-abuse checks are strict on request trust and size, but they do not require CAPTCHAs, third-party anti-bot vendors, or invasive fingerprinting.
- Legitimate users still get the existing calm retry/reload guidance rather than hostile security copy.
