# Prompt 11 Wayfinding And Navigation Contract

Prompt 11 defines one launch navigation model and applies it through the shared shell.

## Navigation layers

### Primary navigation

Primary navigation remains the public top-level IA:

- About
- Programmes
- Events & Updates
- Get Involved
- Safeguarding
- Contact

Primary navigation is always reachable without JavaScript. The mobile menu only changes presentation, not availability.

### Utility navigation

Utility navigation now carries fast trust and contact routes:

- Email the team
- Instagram
- Privacy Notice
- Safeguarding

This lives in the desktop utility bar and is repeated inside the mobile panel so the same destinations stay reachable on small screens.

### Footer navigation

The footer keeps the grouped route clusters from prompt 02:

- Explore
- Get Support
- Legal
- Social

Prompt 11 adds a persistent footer support panel above those groups so support remains visible even on routes with long bodies.

## Contextual header CTA rules

The shell CTA is no longer globally fixed.

| Route context | Header CTA |
| --- | --- |
| home, about, programmes, events, legal, not-found | `Join a session` |
| sessions and contact | `Get support` |
| get involved, volunteer, partner | `Contact the team` |
| safeguarding | `Raise a concern` |

The mapping lives in `site/src/content/shellConfig/default.json`.

## Current-page handling

- primary items use active-section matching, not exact-string matching only
- detail routes stay highlighted under their parent section
- volunteer and partner stay visually nested under Get Involved through breadcrumb parentage, even though they are not nested in the URL

## Contact-route decision

Prompt 11 keeps `Contact` as a real route.

The site still exposes contact in multiple places:

- primary navigation
- footer support panel
- contextual shell CTA on involvement routes
- support forms and page-local actions

That keeps contact easy to reach without fragmenting the journey back into hash-link-only behavior.
