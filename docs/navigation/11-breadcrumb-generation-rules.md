# Prompt 11 Breadcrumb Generation Rules

Prompt 11 moves breadcrumb ownership out of page templates and into the shell model.

## Source of truth

- page metadata: `site/src/content/pageDefinitions/launch.json`
- explicit shell parent map: `site/src/content/shellConfig/default.json`
- runtime builder: `site/src/lib/content/site-shell.ts`

## Rules

1. Breadcrumbs are hidden on `home` and `not-found`.
2. Every visible breadcrumb trail starts with `Home`.
3. Root-level launch pages use `Home > Current page`.
4. Detail pages add explicit parents from the shell parent map.

## Parent mappings in use

| Page | Parent |
| --- | --- |
| programme detail pages | Programmes |
| session detail pages | Sessions |
| Volunteer With Us | Get Involved |
| Partner With Us | Get Involved |

## Back-link rules

If a page has an explicit breadcrumb parent, the shell also renders a back-link above the breadcrumb trail.

Examples:

- session detail: `Back to Sessions`
- volunteer detail: `Back to Get Involved`
- partner detail: `Back to Get Involved`

## Why explicit mapping is used

URL nesting alone is not enough for launch:

- `volunteer` and `partner` are not nested under `/get-involved/` in the public URL
- breadcrumb hierarchy still needs to express that they belong to the involvement branch

That is why prompt 11 uses a parent map instead of a route-splitting heuristic.
