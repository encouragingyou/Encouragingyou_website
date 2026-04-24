# Prompt 39 - Metadata Contract And Inheritance

## Core contract

`site/src/lib/content/site-seo.ts` now returns one normalized metadata object with:

- `title`
- `description`
- `summary`
- `canonicalPath`
- `canonicalUrl`
- `robots`
- `indexable`
- `breadcrumbLabel`
- `openGraph`
- `twitter`

`site/src/layouts/BaseLayout.astro` is the only place that turns that object into head tags.

## Inheritance order

### 1. Site defaults

From `site/src/content/seo/default.json`:

- title separator
- site name
- locale
- default robots / noindex robots
- default Open Graph type
- default social-preview media id

### 2. Page directive

Also from `site/src/content/seo/default.json`:

- explicit `index` vs `noindex`
- primary topic
- search intent
- optional title override

This is the route-level policy layer.

### 3. Canonical content source

Per route family, title/description/summary still come from the existing production content sources:

- Home: `site/src/content/homePage/default.json`
- Static public routes: `site/src/content/routePages/default.json`
- Programme details: `site/src/content/programmes/*.json`
- Session details: `site/src/content/sessions/*.json`
- Editorial details: `site/src/content/updatesFeed/default.json` plus `editorial-feed.js`

### 4. Runtime override

The route models can still override:

- canonical path for dynamic detail routes
- Open Graph type (`article` for editorial detail)
- conditional indexability (`indexVisible` for editorial detail)
- explicit route media for share preview

## Title strategy

- Home keeps the only hard title override: `EncouragingYou | Youth-led support in Rochdale`.
- All other static routes default to `{page title} | EncouragingYou` unless explicitly overridden later.
- Programme/session/editorial detail routes keep their specific entity titles rather than collapsing back to the parent hub title.

## Canonical strategy

- Self-canonical only.
- Dynamic detail routes pass their own route path into `buildMeta(...)`.
- Flat child routes such as `/volunteer/` and `/partner/` keep self-canonicals even though their header current-state remains attached to `Get Involved`.

## Robots strategy

- `index,follow` is the default.
- `noindex,follow` is the deliberate exception for legal/trust utility pages, the 404 route, and the component harness.
- Editorial details can override to noindex when `indexVisible` becomes false.

## Share preview strategy

- Route media is preferred when the route model already owns a relevant asset.
- Fallback is the `hero-home` illustration.
- Fallback is blocked if the route family is restricted by the media truth model.
- Safeguarding therefore gets no generic fallback image.

This protects Prompt 38’s disclosure work instead of bypassing it.

## Validation and tests

- `site/scripts/validate-seo-metadata.mjs` checks title/description coverage, unique indexable titles, unique indexable canonicals, and explicit search-intent directives.
- `site/tests/seo-metadata.test.mjs` checks the data contract.
- `site/tests/e2e/contracts/seo-metadata.spec.mjs` checks the rendered HTML.

## Extension rule for future prompts

If a new route is added:

1. Add the page definition.
2. Add or update its canonical content source.
3. Add a `seo.default.json` directive.
4. Let the route model call `buildMeta(...)`.
5. Do not hand-author head tags in the page template.
