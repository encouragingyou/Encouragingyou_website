# Prompt 46 - Mobile, Keyboard, And Responsive E2E Policy

## Principle

A critical journey is not considered healthy if it only works comfortably on desktop with a pointer.
Prompt 46 therefore treats input mode and viewport state as part of the journey contract.

## Required journey variants

### Desktop baseline

Every P0 journey should have at least one desktop run that proves the full happy path.

### Narrow mobile touch

At least one representative mobile/touch path must exist for:

- session discovery
- trust/legal interaction
- form submission on a narrow viewport

Prompt 46 covers this with:

- the mobile Youth Club discovery journey
- the mobile accessibility feedback journey

### Keyboard-only interaction

At least one conversion-critical journey must prove that pointer input is not required.

Prompt 46 covers this with the volunteer enquiry flow, which uses keyboard activation and keyboard-driven form input.

### No-JavaScript fallback

At least one high-value form journey must prove that the redirect fallback still works.

Prompt 46 covers this with the no-JavaScript CV Support enquiry path.

## Authoring rules for future journey tests

- Prefer semantic locators based on visible link text, button labels, headings, and form labels.
- Use keyboard activation helpers rather than brittle tab-count scripts unless the contract is explicitly about tab order.
- Use mobile-specific `test.use(...)` blocks for touch coverage instead of mutating the page state ad hoc inside the test body.
- Treat sticky headers, nav drawers, and CTA reachability as part of the journey, not postscript layout trivia.
- Assert nearby trust copy or legal links when they are part of the user decision point.

## What not to do

- Do not create a separate mobile copy of every route contract.
- Do not turn responsive journey tests into pixel-perfect visual tests.
- Do not encode brittle assumptions about DOM wrapper depth, animation timing, or exact scroll positions unless that behavior is the contract under test.
