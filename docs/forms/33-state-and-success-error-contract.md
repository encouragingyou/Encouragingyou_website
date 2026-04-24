# Prompt 33 State And Success Error Contract

Date: 2026-04-23

## Shared UI States

The shared `SupportForm` now supports the following visible states:

| State | Trigger | User-visible result |
| --- | --- | --- |
| `idle` | initial render or recovered form | no status message |
| `invalid` | client or server validation failure | inline field errors plus summary status |
| `submitting` | client-enhanced fetch in flight | disabled submit button and sending message |
| `success` | validated submission stored successfully | success message with reference ID |
| `rate-limited` | repeated submissions exceed threshold | error-toned status with retry guidance |
| `spam-blocked` | honeypot, timing, origin, or invalid-context failure | error-toned status without exposing internal rules |
| `error` | storage/runtime failure | retryable error with email fallback still visible |

## Route Behavior

### Enhanced flow

- stays on the same route
- resets visible form fields after success
- keeps shell, breadcrumb, and nearby trust surfaces visible

### No-JS flow

- submits normally with `POST`
- server redirects back to the originating route
- status is reconstructed from query params and anchored to the enquiry panel

## Query-State Contract

`site/src/lib/forms/enquiry-contract.js`

- `enquiry`
- `enquirySurface`
- `enquiryCode`
- `enquiryRef`
- optional `context`
- optional `form`

These query values are treated as display-state only.
They do not bypass validation or change server-side routing.

## Session Context Behavior

Session-detail routes now hand users into Contact with a validated context.

Example:

- `/sessions/cv-support/`
- click `Ask to join`
- redirect target: `/contact/?context=session%3Acv-support#contact-form`

On Contact this produces:

- a visible context notice
- a safe return link back to the session route
- a preselected reason where appropriate

## Copy Rules

- success copy comes from the structured form-surface contract
- validation messages stay short and directive
- blocked/rate-limited messages stay honest without revealing anti-abuse internals
- the email fallback remains visible even when the secure form fails
