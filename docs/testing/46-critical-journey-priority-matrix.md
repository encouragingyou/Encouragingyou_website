# Prompt 46 - Critical Journey Priority Matrix

## Purpose

Prompt 46 adds a dedicated end-to-end journey layer on top of the broader route, accessibility, visual, and structural coverage from Prompt 45.
The goal is to prove that the highest-value public journeys still work from first step to completed outcome, including the surrounding trust and legal context.

## Priority journeys

| Priority | Journey                                                               | Why it matters                                                                                                                            | Routes exercised                                                                                             | Primary device coverage | Current tags                       |
| -------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------- | ---------------------------------- |
| P0       | Homepage to session discovery to contextual enquiry                   | A visitor must be able to find a live offer, understand the route, and ask to join without losing session context.                        | `/` -> `/sessions/` -> `/sessions/cv-support/` -> `/contact/?context=session:cv-support`                     | Desktop                 | `@journey-pr`                      |
| P0       | Mobile session discovery through Get Involved                         | The mobile route to live sessions must remain reachable through the primary nav and keep the contact handoff usable on a narrow viewport. | `/` -> `/get-involved/` -> `/sessions/` -> `/sessions/youth-club/` -> `/contact/?context=session:youth-club` | Mobile touch            | `@journey-pr`, `@journey-mobile`   |
| P0       | Volunteer enquiry via keyboard                                        | Core conversion cannot depend on mouse interaction or pointer-only affordances.                                                           | `/get-involved/` -> `/volunteer/`                                                                            | Desktop keyboard        | `@journey-pr`, `@journey-keyboard` |
| P0       | Contact trust path through privacy, cookies, accessibility, and terms | Visitors must be able to inspect the trust/legal surface around the enquiry path and change the analytics objection state coherently.     | `/contact/` -> `/privacy/` -> `/cookies/` -> `/accessibility/` -> `/terms/` -> `/`                           | Desktop                 | `@journey-pr`                      |
| P1       | Safeguarding concern submission                                       | The public safeguarding route must preserve emergency boundaries while still allowing secure non-emergency reporting.                     | `/safeguarding/child/`                                                                                       | Desktop                 | `@journey-rc`                      |
| P1       | Mobile accessibility feedback submission                              | Legal/trust routes must remain actionable on a narrow viewport, including the dedicated accessibility feedback path.                      | `/accessibility/`                                                                                            | Mobile touch            | `@journey-rc`, `@journey-mobile`   |
| P1       | No-JS session enquiry fallback                                        | Session enquiry must still work when the enhanced client path is unavailable.                                                             | `/sessions/cv-support/` -> `/contact/` redirect fallback                                                     | No-JS desktop           | `@journey-rc`, `@journey-fallback` |

## Why these are separate from Prompt 45

- Prompt 45 proves broad route integrity, accessibility smoke coverage, link validity, markup validity, and visual stability.
- Prompt 46 proves user journeys with sequential state changes, form outcomes, legal handoffs, responsive context, and stored result verification.
- The journey layer intentionally checks completion state and trust continuity rather than repeating generic one-route smoke assertions.

## Coverage boundaries

The Prompt 46 journey layer proves:

- Core CTA routing still reaches the correct route family.
- Session context survives the handoff into `/contact/`.
- Dedicated form surfaces still submit successfully.
- Stored enquiry records match the surface, reason, origin path, and route context the user saw.
- Legal/trust routes remain navigable from decision surfaces and preserve analytics objection state.
- Mobile/touch, keyboard, and no-JavaScript variants remain viable for the highest-value journeys.

The Prompt 46 journey layer does not replace:

- Route-level structural checks in `tests/e2e/contracts`.
- Visual baselines in `tests/e2e/visual`.
- Content/schema/link/markup validators in `scripts/`.
- Manual editorial review of copy quality and factual accuracy.
