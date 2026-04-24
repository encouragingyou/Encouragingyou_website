# Prompt 30 - Volunteer Enquiry Contract

Prompt 30 expands the shared form contract so the volunteer route can preconfigure its enquiry flow without baking in route-local transport behavior.

## Shared form-surface additions

`formSurfaces` now supports:

- `eyebrow`
- `messageHelper`
- `submitLabel`
- `defaultReasonId`
- `allowedReasonIds`
- `reasonFieldLabel`
- `reasonSelectPlaceholder`

## Volunteer surface

`volunteer-enquiry` now:

- limits the selectable reason set to `volunteer`
- preselects `volunteer` as the route
- changes helper copy to the volunteer-specific message from the blueprint
- changes the submit label to `Send volunteer enquiry`

## Runtime behavior

- `buildSupportFormModel()` now filters reasons per surface and enforces any default reason against the allowed set.
- `SupportForm.astro` now accepts route-level eyebrow, default reason, reason-label, placeholder, and submit-label overrides.
- Prompt 33 can swap the delivery mechanism without redesigning the volunteer route or rewriting its content model, and now does so through the shared secure endpoint.

## Constraint

Prompt 33 should preserve the surface contract and only replace validation/delivery plumbing where needed.
