# Homepage Assembly

Prompt 17 converts the homepage from a compatibility-driven route into a section-driven production page.

## Canonical inputs

- `site/src/content/homePage/default.json`
- `site/src/content/updatesFeed/default.json`
- `site/src/lib/content/site-content.ts`

`getHomePageModel()` is now the only homepage runtime entrypoint. The route no longer reads compatibility fields such as `quickActions`, `sessionsStrip`, or `supportSection`.

## Route composition

The production route lives in `site/src/pages/index.astro`.

It now assembles the page in this order:

1. `HomeHero`
2. quick-action grid
3. `HomeTrustStrip`
4. `HomeLiveSessionsSurface`
5. programme teaser grid
6. `HomePageTeaser`
7. `FeatureSplit` for broader community support
8. `HomeUpdatesSurface`
9. `FeatureSplit` for involvement
10. `CtaBand` plus `FaqGroup`
11. `HomeContactPanel`

The route iterates `home.sections` directly and switches on `section.kind`. This keeps section order, section identity, and section state tied to canonical content rather than route-local duplication.

## Hero execution

The hero still owns the primary and secondary CTA pair:

- `Join a session`
- `Get support`

Prompt 17 adds two controlled support surfaces above the fold:

- a "Common next steps" support rail driven from `conversionStack.supportingActions`
- a Saturday context panel driven from the `live-sessions` section and `stateSurface.liveSessions`

This keeps the first decision surface richer without creating a second competing CTA stack.

## Layout contract

The route uses section-level `tone` and `width` when present, then applies a small set of kind-based defaults:

- `page-teaser`, `feature-split`, `updates-surface`, and `contact-panel` default to `wide`
- other section kinds default to the standard shell width

This keeps authoring simple while preserving consistent layout intent.

## Discoverability hooks

The homepage now passes `home.structuredData` into `BaseLayout`, keeping the `Organization` and `WebSite` schema attached at the route level rather than buried in prototype HTML.
