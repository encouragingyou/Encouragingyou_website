# Prompt 13 - Content Source Adapter Boundary

`src/lib/content/content-source-adapter.ts` is now the boundary between physical launch content storage and the rest of the app.

## What the adapter is allowed to do

- Import local JSON collections.
- Index records by id or slug.
- Expose narrow getters such as `getRoutePageContentById(...)` or `getFormSurfaceById(...)`.

## What the adapter must not do

- Build breadcrumbs.
- Choose CTA variants.
- Derive session labels.
- Read media files directly.
- Contain route-template branching.

Those responsibilities stay in `site-content.ts`.

## Why this boundary matters

- A future CMS adapter can return the same shapes without forcing Astro route rewrites.
- Validation can run against content files directly.
- Tests and page loaders stay deterministic because launch content is still local and synchronous.

## Stability contract

- Keep getter names stable unless the route model contract truly changes.
- Keep ids and slugs canonical in the collections, not in template files.
- Add new content collections through the adapter first, then expose them in route-model builders.
