# Prompt 37 - Consent-Aware Microcopy Contract

> Updated by Prompt 43: cookie-entry microcopy now needs to describe the live aggregate analytics objection model, not an analytics-absent launch.

## Objective

Helper copy that touches privacy, consent, external destinations, downloads, and trust boundaries now has one canonical runtime instead of route-level improvisation.

## Canonical sources

### Shared helper-copy source

- `site/src/content/consentAwareMicrocopy/default.json`

Controls:

- privacy notice action label
- cookie notice action label
- accessibility statement action label
- site policy action label
- shared form helper/status copy
- cookie entry-point notice copy
- accessibility feedback notice copy
- calendar-download notice copy
- contextual external-link notices

### Surface-specific form copy

- `site/src/content/formSurfaces/default.json`

Controls:

- route-specific intro and privacy note
- route-specific privacy highlights
- surface-specific message helper override
- submit and success labels
- allowed reasons and reason-field behavior
- whether optional updates opt-in is shown

### State sources the microcopy must follow

- `site/src/content/storageAccess/default.json`
- `site/src/content/accessibilityStatement/default.json`
- `site/src/content/contactInfo/default.json`

## Current shared rules

### Cookie/state rule

- launch state is `no-banner`
- any cookie-entry helper text must point people to `/cookies/`
- do not mention a banner, preferences pop-up, or stored consent record unless `storageAccess.settings` changes first

### Updates opt-in rule

- the updates checkbox is surface-controlled, not globally forced
- `accessibility-feedback` and `safeguarding-concern` keep the opt-in hidden
- general, involvement, volunteer, and partner forms may still expose it

### JavaScript rule

- the form confirmation model is `reload-confirmation`
- helper text must stay truthful with and without JavaScript
- no-JS fallback copy belongs in the shared form microcopy, not in route-local prose

### External-link rule

- general external-link warnings remain omitted by default
- social-platform warnings are shown contextually where the destination meaningfully leaves the site
- map-link warnings are only shown if a live public directions link exists

### Download rule

- session-detail routes show the calendar-download notice when `.ics` is available
- unavailable calendar state uses shared fallback wording instead of ad hoc route copy

## Runtime integration points

- `buildSupportFormModel()` in `site/src/lib/content/site-content.ts`
- `getAccessibilityPageModel()` in `site/src/lib/content/site-content.ts`
- `getSitePolicyPageModel()` in `site/src/lib/content/site-content.ts`
- `buildContactMethodCardModel()` in `site/src/lib/content/site-content.ts`
- `getSessionDetailModel()` / `buildSessionHubCardModel()` in `site/src/lib/content/site-content.ts`
- `getSupportFormMicrocopy()` in `site/src/lib/content/editorial-guidance.ts`

## Editing rules

1. If the text is global and state-aware, edit `consentAwareMicrocopy/default.json`.
2. If the text belongs to one form surface only, edit `formSurfaces/default.json`.
3. If the text depends on launch-state truth, update the relevant state source first:
   - `storageAccess/default.json`
   - `contactInfo/default.json`
   - `accessibilityStatement/default.json`
4. Do not hardcode helper text directly in route templates unless the text is purely presentational and not part of a trust boundary.

## Validator expectations

`site/scripts/validate-structured-content.mjs` now enforces:

- the accessibility feedback surface id stays aligned between the statement and microcopy source
- the cookie entry-point mode stays aligned with the cookie/storage state
- the dedicated accessibility form surface keeps:
  - the `accessibility` reason;
  - hidden reason mode; and
  - updates opt-in disabled

## Output

- Canonical shared helper source: `site/src/content/consentAwareMicrocopy/default.json`
- Shared runtime wiring: `site/src/lib/content/site-content.ts`
