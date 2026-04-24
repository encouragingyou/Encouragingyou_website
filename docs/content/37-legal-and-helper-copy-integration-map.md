# Prompt 37 - Legal and Helper-Copy Integration Map

## Purpose

This map shows where the new legal/trust copy surfaces are rendered and which canonical source controls them.

| Touchpoint | Implementation surface | Canonical source | Current behavior |
| --- | --- | --- | --- |
| Accessibility Statement route | `site/src/pages/accessibility/index.astro` | `site/src/content/accessibilityStatement/default.json` | renders statement scope, evidence summary, limitations, feedback route, and review triggers |
| Terms / Site Policy route | `site/src/pages/terms/index.astro` | `site/src/content/sitePolicy/default.json` | renders live site-purpose, fair-use, external-link, download, IP, and review boundaries |
| Shared form privacy/title/helper copy | `site/src/components/forms/SupportForm.astro` via `buildSupportFormModel()` | `site/src/content/consentAwareMicrocopy/default.json` + `site/src/content/formSurfaces/default.json` | keeps point-of-collection title, helper text, no-JS note, submit status text, and privacy link label synchronized |
| Accessibility feedback intake | accessibility route form block | `accessibilityStatement/default.json`, `formSurfaces/default.json`, `consentAwareMicrocopy/default.json` | uses dedicated `accessibility-feedback` surface with no updates opt-in |
| Contact/social external note | `site/src/components/ui/ContactMethodCard.astro` | `consentAwareMicrocopy.default.json` | Instagram card shows a contextual external-platform note |
| Session calendar notice | `site/src/components/sections/SessionDetailTemplate.astro` | `consentAwareMicrocopy/default.json` | session-detail routes explain `.ics` download boundaries consistently |
| Session hub unavailable-calendar copy | session hub card model | `consentAwareMicrocopy/default.json` | unavailable calendar state uses the shared fallback wording |
| Cookie entry-point guidance | accessibility + site policy models | `storageAccess/default.json` + `consentAwareMicrocopy/default.json` | legal/trust routes point people to `/cookies/` and do not mention a banner |
| Privacy collection-point coverage | `/privacy/` route | `privacyNotice/default.json` + `formSurfaces/default.json` | all live form surfaces, including accessibility feedback, stay represented in the full notice |
| Future public directions note | contact/accessibility/legal models | `contactInfo/default.json` + `consentAwareMicrocopy/default.json` | map warning copy stays dormant until a public directions URL exists |

## Route families now covered

- Home contact panel
- Contact
- Get Involved
- Volunteer
- Partner
- Safeguarding family
- Accessibility Statement
- Terms / Site Policy
- Session detail routes
- Privacy Notice
- Cookie Notice

## Practical rule

If a legal/helper string changes in more than one place, the fix should usually start in:

- `consentAwareMicrocopy/default.json` for shared trust-boundary copy, or
- `formSurfaces/default.json` for one form surface only

not in route-local Astro templates.
