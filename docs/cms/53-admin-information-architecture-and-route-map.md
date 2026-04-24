# Prompt 53 - Admin Information Architecture and Route Map

## Intent

The admin portal is organized around recognizable editorial tasks rather than raw schema entities. Editors start from route families and page groups they already know from the public site, then open the linked CMS documents underneath those groups.

## Route map

- `/admin/`
  Dashboard with role summary, live review count, workflow-state overview, and featured workstreams.
- `/admin/content/`
  Route-led content group index, grouped into families such as Programmes, Sessions, Get involved, Legal and trust, and Global.
- `/admin/content/[routeId]/`
  Workstream detail for one public route family, showing editable surfaces, publisher-held surfaces, locked surfaces, and the linked CMS documents that feed that route.
- `/admin/documents/[documentSlug]/`
  Generic constrained document editor for one CMS record, with text-only controls, repeatable fixed-template items, live diff, isolated preview, and workflow actions.
- `/admin/review/`
  Publisher-facing review queue populated from the isolated admin workspace and guarded by server-side capability checks.

## Navigation model

- Primary navigation stays shallow: Dashboard, Content groups, Review queue.
- The dashboard acts as the “what changed” landing view.
- Editors find content by public route label first, not by collection name.
- Document editors always show linked workstreams so the editor can orient back to the public route context quickly.

## Server-side boundary

- The route family is rendered under `/admin/`, but it is deliberately modeled as a separate origin concern.
- Prompt 54 replaces the placeholder role with invitation-only local accounts, MFA, and server-managed opaque sessions.
- Admin HTML responses are forced `noindex, nofollow, noarchive` and `no-store`.
- Public analytics scheduling is skipped on admin routes.

## Prompt 54 dependency

Prompt 54 lands real authenticated sessions and authorization checks without changing the information architecture above.
