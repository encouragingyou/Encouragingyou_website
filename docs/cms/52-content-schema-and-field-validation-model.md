# Prompt 52 - Content Schema and Field Validation Model

## Outcome

Prompt 52 turns the Prompt 51 boundary registry into a typed editorial contract without changing the public presentation architecture.

The implementation has four layers:

1. `site/src/content/config.ts`
   - Continues to define the typed Astro content schemas for the public-site collections.
   - Now also defines `cmsWorkflow`, which formalizes the editorial lifecycle contract.

2. `site/src/content/cmsScope/default.json`
   - Remains the boundary and field-registry source of truth from Prompt 51.
   - Still answers what may be edited, by whom, and under which mutation primitive.

3. `site/src/lib/cms/content-model.js`
   - Converts the approved collections into CMS document-type definitions.
   - Maps collection-level records into durable document ids and revision ids.
   - Produces the schema catalog, write-model seed, published read model, and migration diff report.

4. Generated artifacts in `site/src/data/generated/`
   - `cms-schema-catalog.json`
   - `cms-write-model-seed.json`
   - `cms-public-read-model.json`
   - `cms-migration-diff-report.json`

## Typed Schema Strategy

The CMS does not create a second free-form schema beside the public site. Instead it wraps the existing public collection schemas with a stricter editorial document model.

The shape is:

- Astro collection schema:
  - validates the underlying public content structure.
- CMS document type:
  - defines the write-model record boundary.
- CMS surface binding:
  - defines which selectors inside those records are editable and under what rule.

That means the public site keeps its stable typed content domain while the CMS gains explicit document records, lifecycle state, and publication boundaries.

## Document Types

The current write model is organized around durable document records, not route-local blobs. The main document types are:

- `site-settings`
- `shell-config`
- `contact-info`
- `home-page`
- `route-page`
- `programme`
- `programme-page-defaults`
- `programme-page`
- `session`
- `session-page`
- `updates-feed-config`
- `editorial-item`
- `faq-group`
- `form-surface`
- `privacy-notice`
- `accessibility-statement`
- `site-policy`
- `storage-access`
- `seo-defaults`
- `seo-page-directive`
- `media-library-meta`
- `media-asset-annotation`
- `safeguarding-info`
- `involvement-route`

Each document type declares:

- source collection
- source schema reference
- publication target
- record strategy
- a sample field-schema tree derived from the actual seeded payload

## Field Validation Model

Per-field validation now comes from two combined sources:

1. Structural validation from the Astro content schema in `site/src/content/config.ts`
2. Editorial validation from the CMS surface catalog

The CMS surface catalog adds:

- ownership class
- mutation primitive
- max length
- allowed formatting
- link policy
- semantic grouping
- defaulting strategy

This matters because the same underlying record may contain both:

- editable content-bearing fields
- operator-controlled metadata
- developer-owned fields that remain locked

## Defaults and Optionality

Defaults are intentionally seeded from the current published launch baseline rather than invented a second time.

That means:

- the source collections remain the truth for initial values
- `cms-write-model-seed.json` becomes the first revision baseline
- `cms-schema-catalog.json` describes the field tree and validation profile
- `cms-migration-diff-report.json` proves the generated published snapshot still matches the public baseline

Nullability and optionality remain inherited from the public collection schemas and the current seeded content shape.

## Validation Guardrails

The CMS contract now blocks silent drift in three ways:

- `site/scripts/validate-cms-scope.mjs`
  - validates Prompt 51 boundaries
  - validates Prompt 52 workflow and generated artifacts
- `site/tests/cms-scope.test.mjs`
  - protects role and boundary rules
- `site/tests/cms-state-machine.test.mjs` and `site/tests/cms-read-model.test.mjs`
  - protect lifecycle, publication, and read-model behavior

## Practical Editing Rule

Editors mutate content-bearing and metadata-bearing fields only. They do not gain control of:

- layout
- component composition
- route creation
- executable behavior
- styling
- schema builders
- structured-data builders
- publication runtime
