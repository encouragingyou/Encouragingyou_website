# Prompt 43 - Event Taxonomy And Property Contract

## Runtime Contract

Implementation lives in:

- `site/src/lib/analytics/contract.js`
- `site/src/lib/analytics/preferences.js`
- `site/src/lib/analytics/store.js`
- `site/src/lib/analytics/server.js`
- `site/src/lib/analytics/client.js`
- `site/src/pages/api/analytics.ts`
- `site/src/pages/api/analytics-preference.ts`

The contract is allowlist-driven. Unknown event names or unexpected properties are rejected.

## Event Catalog

| Event | Source | Required properties | Notes |
| --- | --- | --- | --- |
| `page_view` | middleware on successful HTML GET | `pageId`, `routeFamily`, `entryType` | Optional `sourceFamily` when the referrer is same-origin. |
| `cta_click` | client runtime | `pageId`, `routeFamily`, `surface`, `destinationFamily`, `destinationType`, `variant` | Limited to button-style CTA links. |
| `external_contact_intent` | client runtime | `pageId`, `routeFamily`, `surface`, `method` | Covers `mailto:`, `tel:`, and external social/contact links. |
| `form_start` | client runtime | `pageId`, `routeFamily`, `surfaceId` | Fires once per form surface per page load. |
| `form_validation_failed` | client runtime | `pageId`, `routeFamily`, `surfaceId`, `errorCategory` | Uses only coarse categories such as `email` or `multi-field`. |
| `form_submitted` | server-side enquiry flow | `pageId`, `routeFamily`, `surfaceId` | Recorded only on successful non-safeguarding submissions. |
| `calendar_download_requested` | middleware on `/calendar/*.ics` | `pageId`, `routeFamily`, `calendarId` | Optional `sourceFamily` when same-origin referrer exists. |
| `analytics_preference_changed` | server-side preference endpoint | `pageId`, `routeFamily`, `preferenceState`, `surface` | Current surface is `legal-control` on `/cookies/`. |

## Allowed Property Values

### `pageId`

- Must be one of the seeded page definitions, or `unknown`.

### `routeFamily`

- `home`
- `about`
- `programmes`
- `sessions`
- `get-involved`
- `contact`
- `updates`
- `trust`
- `safeguarding`
- `not-found`
- `unknown`

### `surface`

- `header`
- `footer`
- `hero`
- `page-intro`
- `support-panel`
- `card`
- `notice`
- `content`
- `navigation`
- `legal-control`
- `unknown`

### `destinationType`

- `internal-route`
- `mailto`
- `tel`
- `external-url`

### `method`

- `email`
- `phone`
- `instagram`
- `external`

### `errorCategory`

- `name`
- `email`
- `reason`
- `message`
- `multi-field`
- `unknown`

## Redaction And Exclusion Rules

- No free-text properties are permitted.
- No user identifiers are permitted.
- No raw URLs are persisted in the analytics store.
- No query strings are persisted.
- No per-field values are persisted from forms.
- No safeguarding payloads are recorded.
- No device identifiers, user IDs, consent IDs, or session IDs are generated.

## Deduplication Rules

- `form_start` fires once per form surface per page load.
- `cta_click`, `external_contact_intent`, and `form_validation_failed` use short client-side dedupe windows to avoid double-counting rapid clicks or repeated validation churn.
- `page_view` is counted per successful HTML request.
- `calendar_download_requested` is counted per successful `.ics` request.

## Storage Contract

- The analytics store persists aggregate counters per day in `ANALYTICS_STORAGE_DIR` or `./var/analytics`.
- The file format is a daily JSON summary with `eventName`, allowlisted `dimensions`, and `count`.
- The store does not persist IP addresses, user agents, referrer URLs, or form content.

## Non-Goals

- No cohorting
- No attribution modeling beyond coarse same-origin source family
- No profile building
- No personalized content targeting
- No ad measurement
