# Prompt 27 - Filtering, Empty State, And Pinning Rules

Prompt 27 adds filtering and featured-item behavior as progressive enhancement, not as a JS-only dependency.

## Filtering rules

- Filter controls are buttons, because they change in-page state rather than navigate.
- The feed stays fully readable without JavaScript.
- JavaScript enhancement is marked with `data-editorial-enhanced="true"` so browser tests can wait for the real interactive state.
- Filtering hides and reveals cards in place; it does not replace the route shell.

## Visibility rules

There are two separate empty-state paths:

- route empty state: used only when no public editorial items exist
- filter empty state: used when the route has items, but the active filter has zero matches

These states must stay distinct so the route can remain useful even when one category is empty.

## Pinning rules

- A featured item can lead the route, but only while it is still publishable.
- Past dated event items do not stay pinned as if they are still upcoming.
- `archiveBehavior` decides whether a past item drops into the normal feed or disappears from public view.

## Styling safeguard

Prompt 27 also restores the expected `hidden` behavior globally in `site/src/styles/base.css`. That prevents component-level `display` rules from breaking filtered or collapsed states elsewhere in the UI.
