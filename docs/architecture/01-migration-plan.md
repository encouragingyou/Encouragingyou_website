# Migration Plan

Date: 2026-04-22

## Goal

Move from `source/blurpint/` to a production-ready static-first application without losing the working visual reference, raw media sources, or already-useful copy patterns.

## Migration principles

- Do not delete `source/blurpint/` during migration.
- Keep one source of truth for every data domain.
- Preserve working behavior until replacement behavior exists and is verified.
- Prefer low-risk parallel build-out over in-place rewrites.
- Reuse raw artwork from `source/media_attachment/` rather than duplicating original assets.

## Recommended target structure

Prompt 01 reserves, but does not yet scaffold, this structure:

```text
site/
  package.json
  astro.config.mjs
  src/
    components/
    content/
    data/
    layouts/
    lib/
    pages/
    styles/
  public/
    favicon.svg
    icons/
    images/
```

## Source-of-truth rules

Adopt these rules before any broad migration starts:

| Domain | Source of truth | Notes |
| --- | --- | --- |
| Raw artwork | `source/media_attachment/` | Keep untouched as the master archive. |
| Current prototype | `source/blurpint/` | Reference only once the new app starts. Do not maintain parallel feature development in both places. |
| Derived production images | `site/public/images/` and `site/public/icons/` | Generated from the raw artwork pipeline, not edited by hand. |
| Sitewide contact and social info | `siteSettings` content object | Must feed footer, contact page, metadata, and forms. |
| Session data | `sessions` content collection | Must generate pages, human-readable labels, schema, and ICS files. |
| Programme data | `programmes` content collection | Must drive overview and detail routes. |
| Events and updates | `events` and `updates` collections | Required for the future events/updates index and detail pages. |
| Legal content | `legal`, `contactInfo`, `safeguardingInfo` collections | Prevent hardcoded legal copy spread across templates. |

## Phase plan

### Phase 0: Freeze and document the prototype

Deliverables:

- audit docs from prompt 01
- inventory JSON
- explicit architecture decision

Exit criteria:

- later prompts understand that `source/blurpint/` is a prototype baseline, not the target architecture

### Phase 1: Lock scope, IA, and content model

Inputs:

- prompts 02 to 05

Actions:

- confirm launch scope versus phase-two backlog
- lock final sitemap and navigation
- define schema for site settings, programmes, sessions, events, updates, FAQs, legal, and contact info

Exit criteria:

- route list is stable enough to scaffold `site/`
- content types are defined before page migration

### Phase 2: Scaffold the new Astro app

Inputs:

- prompt 06 and prompt 07 outputs

Actions:

- create `site/` Astro app
- add package management, formatting, linting, type checking, and base scripts
- create layout, component, and styles directories
- port shared assets and favicon

Exit criteria:

- `site/` builds locally
- base shell and token layers exist

### Phase 3: Migrate foundation systems first

Inputs:

- prompts 08 to 15

Actions:

- centralize design tokens
- rebuild layout foundations and global shell
- extract buttons, cards, panels, forms, accordions, badges, and CTAs
- replace repeated shell markup with shared layouts
- move content into structured collections

Exit criteria:

- no launch page depends on duplicated shell HTML
- all reusable modules exist before broad page build-out

### Phase 4: Normalize sessions, calendars, and metadata

Inputs:

- prompt 14 and SEO/legal prompts

Actions:

- create a single structured session model
- generate recurring session labels at build time
- generate ICS files from the same session objects
- generate `Event` structured data from the same source

Exit criteria:

- session pages, session index, schema, and ICS data no longer drift apart

### Phase 5: Rebuild launch pages in priority order

Recommended page order:

1. home
2. about
3. programmes overview
4. programme detail pages
5. sessions hub and session detail pages
6. get involved hub
7. volunteer and partner pages
8. contact
9. safeguarding
10. privacy, cookies, accessibility, and terms
11. events/updates index and detail templates

Rule:

- each migrated page must match or improve on the best working behavior from the prototype before the old page can be considered deprecated

### Phase 6: Replace prototype conversion paths

Actions:

- replace `mailto:` forms with validated server-side or serverless submission handling
- add success, error, and spam-protection states
- connect privacy microcopy and consent behavior to the real form flow

Exit criteria:

- no launch-critical enquiry path depends on the visitor having a local email client

### Phase 7: QA, deployment, and cutover

Actions:

- add automated accessibility, broken-link, and E2E checks
- set up preview deploys and production deployment
- run content QA and legal QA
- compare migrated pages against the prototype and brief

Exit criteria:

- launch routes exist in `site/`
- QA gates pass
- prototype can be archived as a reference, not the served product

## Migration risks and mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Duplicate sources of truth | Copy drift between HTML, JS, ICS, and later CMS data will create inconsistent session info | Normalize content before broad page migration |
| Premature page migration | Rebuilding pages before schema and shell are set will create rework | Follow prompt order and scaffold after IA/schema decisions |
| Asset sprawl | Raw artwork and derived assets can drift if copied by hand | Keep raw assets in `source/media_attachment/` and generate production assets |
| Form rework | Adding secure forms late can force legal and UX changes across multiple pages | Design the form contract early and use it across all enquiry routes |
| Trust regressions | Safeguarding/privacy pages can become disconnected from conversion pages | Centralize trust content and surface it in templates, not just legal pages |

## Handoff assumptions for future prompts

- The new production root should be `site/`.
- `source/blurpint/` should remain readable and runnable while migration is underway.
- New prompts should not add major new pages directly to the static prototype unless a later decision explicitly reverses this ADR.
