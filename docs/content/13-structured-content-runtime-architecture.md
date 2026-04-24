# Prompt 13 - Structured Content Runtime Architecture

Prompt 13 finishes the move away from route-local copy by splitting content loading into three layers inside `site/`.

## Runtime shape

1. Canonical content lives in `src/content/`.
2. `src/lib/content/content-source-adapter.ts` is the only module that knows where launch content is physically stored.
3. `src/lib/content/site-content.ts` composes route-ready models from those sources and from shared runtime helpers such as media lookup and session date formatting.
4. Astro routes consume the composed models and no longer embed critical public-facing copy directly in page files.

## Launch source of truth

The new runtime relies on four prompt-13 collections for page composition:

- `formSurfaces/default.json`
- `routePages/default.json`
- `sessionPageContent/default.json`
- `programmePageContent/default.json`

Those sit alongside the existing canonical collections for programmes, sessions, FAQs, trust signals, legal metadata, notices, and home-page content.

## Responsibility split

- Collections own editorial copy, labels, notices, and section headings.
- The adapter owns retrieval only.
- `site-content.ts` owns route composition, derived badges, breadcrumbs, card models, and fallback assembly.
- Templates own presentation only.

## Fallback rules

- Required trust-critical content is loaded with explicit `requireValue(...)` guards so missing content fails loudly at build/check time.
- Optional blocks remain optional at the template edge.
- Placeholder pages still use structured empty-state records rather than route-local prose.

## CMS migration path

The future CMS swap should replace adapter internals rather than route files.

- Keep collection-shaped outputs stable.
- Preserve route model signatures in `site-content.ts`.
- Continue treating media, shell, and support-form data as shared services instead of bypassing them from templates.
