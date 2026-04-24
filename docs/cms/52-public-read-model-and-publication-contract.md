# Prompt 52 - Public Read Model and Publication Contract

## Outcome

The public site now consumes a generated published snapshot instead of reading editable collections directly.

The key files are:

- `site/scripts/generate-cms-artifacts.mjs`
- `site/src/lib/cms/content-model.js`
- `site/src/data/generated/cms-public-read-model.json`
- `site/src/lib/content/content-source-adapter.ts`

## Chosen Publication Strategy

The publication model is:

- build-time export
- published-content only
- no draft exposure on the public origin
- no provider-specific admin SDK in the public site

This fits the current Astro stack because:

- the site already ships from validated content files
- the public site does not need write access
- the generated read model can remain stable even if the future admin portal changes implementation

## Write Model vs Read Model

The write model is revision-aware:

- document records
- revision states
- audit metadata
- rollback history

The read model is deliberately simple:

- collection-shaped JSON
- already filtered to published state
- no revision or review metadata
- no draft leakage

The public adapter only receives:

- `collections`
- publication metadata
- the guarantee that the snapshot is published-safe

## Integration in the Public Site

`site/src/lib/content/content-source-adapter.ts` now reads the editable/public collections from:

- `site/src/data/generated/cms-public-read-model.json`

Developer-owned collections that are not part of the CMS mutation boundary still load directly from source files.

This keeps the boundary clean:

- public route code sees a stable content contract
- admin-side write complexity stays outside the public runtime

## Publication Contract

The read-model contract now guarantees:

- only `published` revisions are exported
- preview remains isolated to the admin side
- public browsers do not receive approval or draft state
- publication export is deterministic and rebuild-safe

## Current Exported Collections

The generated public snapshot currently exports:

- `siteSettings`
- `shellConfig`
- `contactInfo`
- `homePage`
- `routePages`
- `programmes`
- `programmePageContent`
- `sessions`
- `sessionPageContent`
- `updatesFeed`
- `faqs`
- `formSurfaces`
- `privacyNotice`
- `accessibilityStatement`
- `sitePolicy`
- `storageAccess`
- `seo`
- `mediaLibrary`
- `safeguardingInfo`
- `involvementRoutes`

## Why This Matters For Prompt 53

Prompt 53 can now build the admin UI against:

- the write-model documents and revisions
- the state machine
- the generated public snapshot contract

It does not need to teach the public site how to understand drafts, review states, or admin-vendor details.
