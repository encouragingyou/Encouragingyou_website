# Prompt 46 - Playwright E2E State Fixtures And Test Data

## New shared support modules

Prompt 46 introduces a dedicated journey harness under `site/tests/e2e/support`:

- [journey-fixtures.mjs](/Users/test/Code/new_website/site/tests/e2e/support/journey-fixtures.mjs:1)
- [journeys.mjs](/Users/test/Code/new_website/site/tests/e2e/support/journeys.mjs:1)
- [storage.mjs](/Users/test/Code/new_website/site/tests/e2e/support/storage.mjs:1)

These modules sit on top of the existing base fixtures, assertion helpers, and form helpers from Prompts 05, 33, and 45.

## Fixture model

### `journeyData`

`journeyData` creates unique per-test submission data:

- unique email address
- human-readable sender name
- nonce-tagged message content via `journeyData.message(...)`

This allows journey tests to verify persisted enquiry records deterministically without requiring a special test-only API or mutable global reset route.

### `journeyAudit`

`journeyAudit` records:

- explicit journey steps noted by the test
- failed `document`/`fetch`/`xhr` responses seen during the run
- current URL and viewport on failure

When a journey test fails, the fixture attaches a `journey-audit` JSON artifact to the Playwright report alongside the standard retained trace, screenshot, and video artifacts already configured in `playwright.config.mjs`.

## Storage-backed assertions

### Enquiry storage

Journey tests now verify real persisted outcomes through [storage.mjs](/Users/test/Code/new_website/site/tests/e2e/support/storage.mjs:1):

- `listEnquiryRecords()`
- `waitForEnquiryRecord(matcher, options)`

The storage helper reads the same filesystem-backed enquiry output used by the preview runtime:

- `site/output/playwright/enquiries/`

The tests wait for a record that matches the generated journey email/message nonce and then assert:

- `surfaceId`
- `originPath`
- `reason.id`
- `context.id` where applicable

### Analytics state

The same storage helper now exposes `readMatchingAnalyticsCount(matcher)` so analytics-governance tests and journey tests can use one shared aggregate-reader implementation.

## State controls covered by Prompt 46

### Consent / analytics preference state

The legal journey uses the public cookie route and the real preference control, not a mock:

- `Turn off anonymous analytics`
- cookie expectation through `page.context().cookies()`
- runtime confirmation via `html[data-analytics-collection="false"]`

### Responsive state

Journey suites use explicit device modes rather than only one desktop profile:

- desktop default
- mobile touch via `viewport`, `isMobile`, and `hasTouch`
- no-JavaScript fallback via `javaScriptEnabled: false`

### Keyboard state

Keyboard-only activation is expressed through reusable helpers in [journeys.mjs](/Users/test/Code/new_website/site/tests/e2e/support/journeys.mjs:1) and [forms.mjs](/Users/test/Code/new_website/site/tests/e2e/support/forms.mjs:1):

- `activateWithKeyboard(locator)`
- `fillSupportFormWithKeyboard(page, values)`

The volunteer journey uses these helpers so success does not depend on pointer-only interactions.

## Why no hidden test API was added

Prompt 46 deliberately avoids introducing a production-style test backdoor for:

- enquiry writes
- analytics preference state
- session context

Instead, the suite relies on:

- public routes
- public forms
- real cookies
- real file-backed preview outputs
- unique submission data for deterministic matching

That keeps Prompt 47 free to harden security around the exact same public surfaces.
