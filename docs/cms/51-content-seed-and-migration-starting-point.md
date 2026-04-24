# Prompt 51 - Content Seed and Migration Starting Point

## Goal

The first CMS seed should come from the existing structured public-site content, not manual re-entry.

## Canonical Seed Sources

The seed map is now recorded in `site/src/content/cmsScope/default.json` under `seedSources`.

Primary sources:

- `site/src/content/siteSettings/default.json`
- `site/src/content/shellConfig/default.json`
- `site/src/content/routePages/default.json`
- `site/src/content/homePage/default.json`
- `site/src/content/programmes/*.json`
- `site/src/content/programmePageContent/default.json`
- `site/src/content/sessions/*.json`
- `site/src/content/sessionPageContent/default.json`
- `site/src/content/updatesFeed/default.json`
- `site/src/content/faqs/default.json`
- `site/src/content/formSurfaces/default.json`
- `site/src/content/privacyNotice/default.json`
- `site/src/content/storageAccess/default.json`
- `site/src/content/accessibilityStatement/default.json`
- `site/src/content/sitePolicy/default.json`
- `site/src/content/seo/default.json`
- `site/src/content/mediaLibrary/default.json`

## Migration Rules

### Preserve stable identifiers

- keep page ids from `pageDefinitions`
- keep programme and session slugs
- keep update-item ids and slugs
- keep form surface ids
- keep FAQ group ids

### Do not flatten trust-critical structure away

The CMS seed must preserve:

- legal section ids
- safeguarding route branch separation
- collection-point ids in privacy data
- publication status and publish dates for updates
- schedule and calendar metadata for sessions

### Split draft/write concerns from public-read concerns

The initial seed should create:

- a draft-capable write model
- a published read model aligned to the existing site

It should not make the public site read draft data directly.

## Migration Shape By Content Family

| Source | Seed key strategy | Important preservation rule |
| --- | --- | --- |
| route pages | page id | keep route ownership and page template assumptions intact |
| home page | section id | preserve current section ordering contract as developer-owned |
| programmes | slug | preserve canonical slug and route family |
| sessions | slug | preserve recurrence, calendar, and structured-data dependencies |
| updates feed | item id + slug | preserve publication state and detail-route identity |
| FAQs | group id | keep FAQ-to-route-family mapping |
| form surfaces | surface id | keep form-routing logic separate from editable helper text |
| privacy / cookies / accessibility / terms | section id | remain operator-controlled, not client-editable |
| SEO | page id | preserve canonical path/indexing controls separately from editable snippet text |
| media metadata | asset id | allow alt text or captions later without opening unrestricted asset upload |

## Technical Starting Point Added In Prompt 51

Prompt 51 does not build the CMS read/write engine yet, but it does create the contract Prompt 52 should honor:

- machine-readable scope and seed registry in `cmsScope`
- lookup helpers in `site/src/lib/cms/`
- validation guardrail in `site/scripts/validate-cms-scope.mjs`

That means Prompt 52 can focus on schema, versioning, and public read-model integration instead of reopening the boundary question.
