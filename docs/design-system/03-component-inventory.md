# Component Inventory

Date: 2026-04-22

Primary code directories:

- `site/src/components/site`
- `site/src/components/ui`
- `site/src/components/forms`
- `site/src/components/sections`
- `site/src/layouts`

## Abstraction boundary

The system is split into four layers:

- layout and shell
- primitives
- composites
- route sections

Rule used for abstraction:

- if markup repeats across routes and carries brand or accessibility behavior, it became a component
- if a pattern is mostly structural but still driven by route content, it became a section component
- if something is strongly page-specific, it stays in the route composition layer

## Layout and shell

### `BaseLayout.astro`

Path:

- `site/src/layouts/BaseLayout.astro`

Responsibility:

- imports global style layers
- renders the skip link
- mounts the shared header and footer
- provides the document shell for all routes

### `SiteHeader.astro`

Path:

- `site/src/components/site/SiteHeader.astro`

Responsibility:

- primary navigation
- route highlighting
- persistent join-session CTA
- shared brand placement

### `SiteFooter.astro`

Path:

- `site/src/components/site/SiteFooter.astro`

Responsibility:

- grouped footer navigation
- public email
- AI illustration disclosure placement
- consistent bottom-of-page trust layer

### `BrandMark.astro`

Path:

- `site/src/components/site/BrandMark.astro`

Responsibility:

- shared wordmark and service-area tag line

## Primitive UI components

### `ButtonLink.astro`

- reusable CTA/link button variants
- supports `primary`, `secondary`, `surface`, and `text`

### `SectionHeading.astro`

- eyebrow + title + optional summary block
- used to keep section intros visually consistent

### `DisclosureNote.astro`

- reusable disclosure pattern for AI artwork and future image notes

### `MediaPicture.astro`

- shared image wrapper for illustrations and icons
- builds responsive `picture` output from structured media metadata
- centralizes lazy/eager handling and alt treatment

### `Breadcrumbs.astro`

- small shared breadcrumb component for non-home routes and recovery states

### `NoticeBlock.astro`

- generic information / important notice panel
- suitable for legal notes, urgent service notes, and route-specific guidance

### `EmptyState.astro`

- recovery-state component for 404 and future empty/error scenarios

## Composite components

### `ActionCard.astro`

- icon-first link card
- used for quick actions and trust-route style tiles

### `SessionSummaryCard.astro`

- reusable summary pattern for recurring sessions
- includes icon, time pill, next label, detail link, and calendar link

### `ProgrammeCard.astro`

- reusable programme summary card
- handles image, disclosure, summary, tags, and CTA

### `FaqGroup.astro`

- native `details/summary` FAQ pattern
- route-friendly reusable disclosure stack

### `SupportForm.astro`

- shared short-form enquiry component
- moves the form pattern out of copied page markup
- uses route-independent reason options from structured content

## Section components

### `HomeHero.astro`

- full-bleed homepage hero with image plane, CTA row, and badge list

### `FeatureSplit.astro`

- media + copy split section
- supports bullets, badges, disclosure, actions, and reversed layout
- used to cover both wider-community and get-involved CTA sections

## Components intentionally not abstracted yet

These remain route-level compositions rather than standalone components:

- the exact homepage trust-strip composition
- the support-and-FAQ two-column arrangement
- the 404 page assembly

Reason:

- the reusable pieces already exist
- further abstraction now would create wrapper components without enough variation to justify them

## Coverage against prompt requirements

Implemented directly in code:

- header
- navigation
- footer
- buttons
- links
- cards
- media blocks
- FAQ blocks
- forms
- disclosure notes
- notice blocks
- session summaries
- hero variant
- CTA panels
- breadcrumbs
- empty/error state

Covered through current primitives plus later composition:

- legal notice blocks
- event cards
- page shells

Planned for later prompts once the related routes are built:

- event/update card variants
- legal-page table-of-contents composition
- fuller error/loading/fallback system
