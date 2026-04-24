# Prompt 36 - Consent Decision Model

> Updated by Prompt 43: the live state is now `informational-notice` with a first-party aggregate analytics objection control, not the original analytics-absent `no-banner` state.

## Canonical state

The launch build uses `storageAccess.settings` in `site/src/content/storageAccess/default.json` as the consent-state source of truth.

## Supported states

### 1. `no-banner`

Use this only when:

- non-essential storage/access technologies are absent;
- no consent record needs to be stored on the device; and
- every active audited behavior is either communication-delivery, service-essential, or an appearance helper that does not need consent.

Launch state:

- `consentExperience: "no-banner"`
- `nonEssentialTechnologiesStatus: "absent"`
- `consentRecordStorage: "absent"`
- `preferenceCenterState: "not-required"`

### 2. `informational-notice`

Reserved for a future build where the site may need a visible storage/access explanation without a full category chooser.

This state is not active at launch.

### 3. `banner`

Required if a future change introduces non-exempt storage/access behavior.

That future implementation must:

- keep new non-essential technologies off until consent is given;
- make reject as easy as accept;
- provide a customize path;
- store consent records intentionally and document their duration;
- provide a persistent revisit/withdraw path; and
- request fresh consent if categories, purposes, or providers change.

## Category model

Prompt 36 uses these registry categories:

- `communication-delivery`
- `service-essential`
- `appearance-helper`
- `statistical`
- `non-essential`

At launch:

- active entries are limited to the first three categories;
- `statistical` and `non-essential` entries are recorded as absent;
- any future active entry with `consentRequirement: "required-before-use"` is incompatible with the current `no-banner` state.

## Sync rules

The validator now enforces:

- `no-banner` cannot coexist with consent-record storage;
- the launch `no-banner` state requires privacy flags for analytics, non-essential cookies, maps, and social embeds to remain absent;
- active registry entries cannot require consent while the registry says non-essential technologies are absent.
