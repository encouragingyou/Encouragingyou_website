# Landing Page Client Change Handoff

Date checked: 2026-04-29

## Summary

The client feedback change set is now implemented as a compact, click-through site experience. The homepage acts as a route hub instead of a long scroll through every page, and the supporting content now lives on dedicated internal routes.

The final QA pass was run against the rebuilt production output through the repository built-preview helper, not the live dev watcher.

## Checked Homepage Route Cards

These homepage route-card destinations were checked directly in browser QA and by first-party link validation:

| Label            | Checked target                        |
| ---------------- | ------------------------------------- |
| Join a session   | `/sessions/`                          |
| Get CV help      | `/programmes/career-support-cv-help/` |
| Visit youth club | `/sessions/youth-club/`               |
| Programmes       | `/programmes/`                        |
| About            | `/about/`                             |
| Get involved     | `/get-involved/`                      |
| Ask a question   | `/contact/`                           |
| Safeguarding     | `/safeguarding/`                      |

## Browser QA Routes

Prompt 10 browser QA checked these routes at `390x844`, `768x1024`, and `1440x900`:

- `/`
- `/sessions/`
- `/sessions/cv-support/`
- `/sessions/youth-club/`
- `/programmes/`
- `/programmes/career-support-cv-help/`
- `/about/`
- `/get-involved/`
- `/contact/`
- `/safeguarding/`

The final Prompt 10 browser spec verifies:

- no horizontal overflow on the checked routes
- no visible main-content text overlap
- route cards and route buttons expose usable tap targets
- homepage route-card targets resolve successfully
- mobile menu opens and closes on every checked route
- visible keyboard focus is present on the mobile menu toggle
- no public phone, public venue postcode, price claim, exact youth age range, proof quote, impact statistic, or unapproved partner-logo claim appears on the checked routes

Browser results:

- `tests/e2e/contracts/client-feedback-final-qa.spec.mjs`: `14 passed`
- Broader final browser suite: `152 passed`

## Required Validation Results

All Prompt 10 validation commands were rerun after the final content and CSS fixes.

| Command                      | Result                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run format:check`       | Passed: `All matched files use Prettier code style!`                                               |
| `npm run lint:eslint`        | Passed with no ESLint output                                                                       |
| `npm run check`              | Passed: `0 errors`, `0 warnings`, `0 hints` across `319 files`                                     |
| `npm run test:unit`          | Passed: `159` tests, `159` pass                                                                    |
| `npm run content:validate`   | Passed: validated `16` route pages, `2` session pages, `4` programme pages, and `10` home sections |
| `npm run seo:validate`       | Passed: validated `24` static route directives and `3` editorial detail routes                     |
| `npm run discovery:generate` | Passed: wrote discovery files for `21` canonical routes                                            |
| `npm run discovery:validate` | Passed: validated `21` sitemap routes, `14` social preview assets, and robots policy               |
| `npm run build`              | Passed: rebuilt the server output successfully                                                     |
| `npm run links:validate`     | Passed: validated `25` documents, `70` assets, and `2305` first-party references                   |

## Public Claim Boundaries

The final checked routes do not publish:

- public phone numbers
- exact venue address or postcode
- pricing
- exact public youth age range
- unapproved proof quotes
- impact statistics
- unapproved partner-logo claims

Proof-boundary copy now avoids public testimonial wording and uses approval-safe language such as proof quotes or public praise quotes.

## Known Limitations

- Exact youth age range still needs client confirmation before it can be published.
- Exact venue and public phone details are still withheld until confirmed.
- Public pricing is not stated because no verified pricing source was supplied.
- Launch imagery remains illustration-led and disclosed as representative artwork, not participant photography.

## Handoff Status

Prompt 10 is complete. The landing-page change set has passed route, viewport, accessibility, content, SEO, discovery, build, and first-party link validation with no unchecked external links added in this handoff.
