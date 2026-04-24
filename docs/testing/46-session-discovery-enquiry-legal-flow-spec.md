# Prompt 46 - Session Discovery, Enquiry, And Legal Flow Spec

## Journey suite layout

Prompt 46 replaces the old monolithic `core-journeys` file with dedicated suites under `site/tests/e2e/journeys`:

- [session-discovery.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/journeys/session-discovery.spec.mjs:1)
- [enquiry-routes.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/journeys/enquiry-routes.spec.mjs:1)
- [legal-trust.spec.mjs](/Users/test/Code/new_website/site/tests/e2e/journeys/legal-trust.spec.mjs:1)

## Session discovery flow

### Desktop CV support journey

The desktop session journey proves:

- the homepage hero CTA reaches `/sessions/`
- the CV Support detail page keeps schedule context visible
- the public calendar file still resolves
- `Ask to join` keeps the visitor on the contextual contact route
- the contact form preserves:
  - session notice
  - reason preselection
  - return link
  - privacy route visibility
- the persisted enquiry record matches:
  - `surfaceId: support-general`
  - `originPath: /contact/`
  - `context.id: session:cv-support`
  - `reason.id: cv-support`

### Mobile Youth Club journey

The mobile session journey proves:

- the primary mobile nav still exposes `Get Involved`
- the live session bridge from `Get Involved` still reaches the sessions hub
- sticky-header behavior does not obscure the critical heading state
- Youth Club still hands off into the contextual contact route
- mobile submission still writes a matching enquiry record

### No-JS fallback journey

The no-JavaScript session journey proves:

- `Ask to join` still reaches `/contact/?context=...`
- the redirect fallback keeps the contextual query state on success
- the status message remains readable after redirect
- the stored enquiry record still matches the session context

## Enquiry route flow

### Volunteer route keyboard journey

The volunteer journey proves:

- the route can be opened from `Get Involved` with keyboard activation
- privacy and safeguarding trust links remain close to the form
- the keyboard-only form path can complete successfully
- the persisted record matches:
  - `surfaceId: volunteer-enquiry`
  - `originPath: /volunteer/`
  - `reason.id: volunteer`

### Safeguarding secure-route journey

The safeguarding journey proves:

- the dedicated secure concern form still works on a nested safeguarding route
- emergency language remains visible before and after submission
- the persisted record matches:
  - `surfaceId: safeguarding-concern`
  - `originPath: /safeguarding/child/`
  - `reason.id: safeguarding`

## Legal and trust flow

### Contact -> Privacy -> Cookies -> Accessibility -> Terms

The trust journey proves:

- the privacy notice is reachable from the live enquiry surface
- the cookie route can change the live analytics objection state
- the objection cookie is set coherently
- legal pages remain linked from the shared footer flow
- the homepage runtime reflects the updated analytics state

### Accessibility feedback flow

The accessibility journey proves:

- the dedicated accessibility feedback form stays usable on mobile
- the legal route does not silently reintroduce the optional updates checkbox
- the stored record matches:
  - `surfaceId: accessibility-feedback`
  - `originPath: /accessibility/`
  - `reason.id: accessibility`

## Registration rule for future routes

When a new high-value route or form surface is added, Prompt 46’s architecture expects three explicit choices:

1. Is this route critical enough to join `tests/e2e/journeys`?
2. Which public outcome should be asserted beyond “page loaded”?
3. Which persisted or runtime state must be verified after the action?

If the answer is only structural or presentational, the route belongs in the existing contract, quality, or visual layers instead of the journey layer.
