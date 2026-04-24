# Prompt 40 - Structured Data Truth Table

Prompt 40 replaces route-local JSON-LD drift with shared builders in `site/src/lib/content/structured-data.js`, route inventory rules in `site/src/lib/content/discovery.js`, and route-model composition in `site/src/lib/content/site-content.ts`.

The guiding rule is simple: emit schema only when the visible page supports it directly.

## Source baseline

- The blueprint in `source/encouragingyou-site-look-and-feel.md` Section 13.6 justifies an `Organization` node.
- The same blueprint in Section 13.7 justifies `Event` schema only when a real public event date exists.
- Section 14.3 sets the SEO baseline: clear titles, internal linking, service-area truth, and structured data for the narrow entities the site can genuinely support.

## Route-family truth table

| Route family                                                     | Schema emitted                                                    | Source of truth                                               | Notes                                                                                                                    |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `/`                                                              | `Organization`, `WebSite`                                         | `siteSettings`, `contactInfo`, homepage metadata              | No fake address block. Rochdale remains the honest service-area anchor.                                                  |
| `/about/`                                                        | `AboutPage`, `BreadcrumbList`                                     | About route content + canonical meta                          | About page describes the organisation; it does not pretend to be a team/profile directory.                               |
| `/programmes/`                                                   | `CollectionPage`, `ItemList`, `BreadcrumbList`                    | Programme collection + canonical meta                         | List order follows the visible programme cards.                                                                          |
| `/programmes/[slug]/`                                            | `WebPage`, `Service`, `FAQPage` when FAQs exist, `BreadcrumbList` | Programme content, linked-session state, FAQ content          | `Service` is justified by the visible programme offer. No reviews, ratings, or fake provider proof.                      |
| `/sessions/`                                                     | `CollectionPage`, `ItemList`, `FAQPage`, `BreadcrumbList`         | Session hub content + FAQ group                               | Keeps recurring live offers separate from editorial updates.                                                             |
| `/sessions/[slug]/`                                              | recurring `Event`, `FAQPage`, `BreadcrumbList`                    | Canonical session schedule + FAQ group                        | Uses the same temporal source as UI labels and ICS generation. If a session is not schedulable, event schema is omitted. |
| `/events-updates/`                                               | `CollectionPage`, `ItemList`, `BreadcrumbList`                    | Editorial feed model                                          | Only public items appear.                                                                                                |
| `/events-updates/[slug]/` current update/opportunity             | `Article`, `BreadcrumbList`                                       | Editorial item detail content                                 | Used for non-event editorial items with visible publish context.                                                         |
| `/events-updates/[slug]/` dated event                            | `Event`, `BreadcrumbList`                                         | Editorial item detail content with confirmed date/time/status | Event schema is only emitted when the event actually has a public date.                                                  |
| `/events-updates/[slug]/` event without confirmed date           | `WebPage`, `BreadcrumbList`                                       | Editorial item detail content                                 | Explicitly avoids fake `Event` schema when the page is acting as a holding surface.                                      |
| `/get-involved/`                                                 | `CollectionPage`, `ItemList`, `FAQPage`, `BreadcrumbList`         | Involvement pathways + FAQ group                              | Mirrors visible pathways rather than inventing jobs or roles data.                                                       |
| `/volunteer/`                                                    | `WebPage`, `FAQPage`, `BreadcrumbList`                            | Volunteer route content + FAQ group                           | No `JobPosting` schema because there is no salary, contract, or vacancy model.                                           |
| `/partner/`                                                      | `WebPage`, `FAQPage`, `BreadcrumbList`                            | Partner route content + FAQ group                             | No fabricated sponsor/funder entities.                                                                                   |
| `/contact/`                                                      | `ContactPage`, `FAQPage`, `BreadcrumbList`                        | Contact route content + contact info                          | Uses email and service-area truth only. No invented telephone or street address.                                         |
| `/safeguarding/`, `/safeguarding/child/`, `/safeguarding/adult/` | `WebPage`, `BreadcrumbList`                                       | Safeguarding route content                                    | Kept intentionally minimal and serious.                                                                                  |
| `/privacy/`, `/cookies/`, `/accessibility/`, `/terms/`           | `WebPage`, `BreadcrumbList`                                       | Legal/trust route content                                     | These pages are `noindex`, but their on-page schema remains aligned with visible content.                                |
| `/404/` and internal preview routes                              | none                                                              | n/a                                                           | Not part of the search/discovery surface.                                                                                |

## Explicit non-goals

- No `LocalBusiness` or street-address schema while venue disclosure is still enquiry-led.
- No `Review`, `AggregateRating`, `Person`, `Employee`, or testimonial schema.
- No `FAQPage` on routes without visible FAQ content.
- No `Event` schema for “date to be confirmed” holding pages.
- No schema that implies documentary participant proof.
