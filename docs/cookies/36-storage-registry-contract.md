# Prompt 36 - Storage Registry Contract

> Updated by Prompt 43: `site/src/content/storageAccess/default.json` now includes the live first-party statistical analytics entry and the objection-preference cookie entry.

## Canonical file

`site/src/content/storageAccess/default.json`

This file is now the implementation-level truth source for the Cookie Notice and the launch consent decision.

## Top-level structure

### `page`

Presentation content for `/cookies/`:

- intro copy
- status note
- summary cards
- table-of-contents targets
- narrative sections
- change-control section

### `settings`

Machine-readable launch state:

- `consentExperience`
- `nonEssentialTechnologiesStatus`
- `consentRecordStorage`
- `consentSchemaVersion`
- `preferenceCenterState`
- `reopenControl`
- `javascriptRequirement`
- `futureDefault`
- `reviewCadence`

### `registry.active`

Audited technologies that are live now. Each entry defines:

- `id`
- `label`
- `category`
- `party`
- `activation`
- `persistence`
- `consentRequirement`
- `provider`
- `purpose`
- `implementation`
- `duration`
- optional `userControl`
- optional `note`

### `registry.absent`

Common storage/access technologies that were explicitly checked and are not active now. Each entry defines:

- `id`
- `label`
- `category`
- `party`
- `detail`
- `reason`

### `registry.futureGuardrails`

Short change-control reminders for classes of future additions that would reopen the consent decision.

## Runtime consumers

- `site/src/lib/content/content-source-adapter.ts`
- `site/src/lib/content/site-content.ts`
- `site/src/pages/cookies/index.astro`

## Validation

`site/scripts/validate-structured-content.mjs` now enforces:

- contents-to-section coverage for `/cookies/`
- unique IDs across active, absent, and future guardrail entries
- no active consent-required entry while launch state is `no-banner`
- no consent record storage while launch state is `no-banner`
- alignment with `site/src/content/privacyNotice/default.json`

## Update rule

No future analytics, embed, consent banner, preference cookie, or storage-backed personalization feature should be merged without updating this registry first.
