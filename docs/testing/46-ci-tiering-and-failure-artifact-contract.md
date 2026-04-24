# Prompt 46 - CI Tiering And Failure Artifact Contract

## Journey scripts

Prompt 46 adds dedicated journey commands in [site/package.json](/Users/test/Code/new_website/site/package.json:1):

- `npm run test:e2e:journeys`
- `npm run test:e2e:journeys:pr`
- `npm run test:e2e:journeys:release`

## Tag model

The journey suites use title tags rather than a separate config file:

- `@journey-pr`
- `@journey-rc`
- `@journey-mobile`
- `@journey-keyboard`
- `@journey-fallback`

## Intended tiering

### Pull request tier

`test:e2e:journeys:pr` should remain the minimum targeted critical-journey suite for routine pull requests.
It covers the public conversion and trust paths most likely to regress:

- desktop session discovery
- mobile session discovery
- keyboard volunteer enquiry
- contact -> privacy -> cookies -> accessibility -> terms trust path

### Release-candidate tier

`test:e2e:journeys:release` should run the full journey directory before launch candidates or production promotions.
This expands the pull-request layer with:

- safeguarding secure-route submission
- mobile accessibility feedback submission
- no-JavaScript session enquiry fallback

### Current repository state

The blocking `ci` command still runs the full Playwright suite, which is stricter than the targeted journey tiering described above.
Prompt 46 therefore adds the journey-specific commands and tagging model now, while leaving workflow-level refinement to later infrastructure prompts.

## Failure artifacts

The current failure-evidence contract for journey suites is:

- Playwright trace retained on failure
- screenshot retained on failure
- video retained on failure
- HTML report written to `site/output/playwright/report`
- full test artifacts written to `site/output/playwright/artifacts`
- `journey-audit` JSON attached when a journey test fails
- GitHub Actions upload of `site/output/playwright` on workflow failure

## Diagnostic expectation

When a journey test fails, maintainers should be able to answer:

- Did the route fail to load?
- Did the CTA or navigation handoff break?
- Did a trust or legal surface disappear?
- Did the form submit but persist the wrong state?
- Did the issue happen only on mobile, keyboard, or no-JavaScript variants?

If a new journey cannot answer those questions with the retained artifacts, it has not met Prompt 46’s diagnostic bar.
