# Prompt 12 - Component API Catalog

## Scope

Prompt 12 turns the earlier visual primitives into a reusable component layer that later route prompts can compose without reopening the abstraction debate.

The main implementation lives in `site/src/components/ui`, `site/src/components/sections`, and the supporting helper `site/src/lib/ui/button.ts`.

## Core primitives

### `Button.astro`

- Purpose: canonical button element for submit, loading, and disabled states.
- Main props: `variant`, `type`, `state`, `disabled`, `fullWidth`, `className`.
- State surface: emits `data-button-state` and `aria-busy` for loading.
- Use when: the control is a real button, especially in forms.

### `ButtonLink.astro`

- Purpose: canonical link-styled action button.
- Main props: `href`, `variant`, `current`, `disabled`, `external`, `fullWidth`, `className`.
- State surface: emits `aria-current`, `aria-disabled`, and `data-button-state`.
- Use when: the action navigates or opens a new route.

### `ActionCluster.astro`

- Purpose: shared CTA row for one or more `ActionLink` objects.
- Main props: `actions`, `align`, `stack`, `fullWidth`, `className`.
- Use when: a route, card, or CTA block needs a stable multi-action layout.

### `Badge.astro`

- Purpose: single status/tag/meta label.
- Main props: `label`, `tone`, `current`, `className`.
- Tones: `default`, `soft`, `accent`, `inverse`, `meta`, `success`.

### `BadgeRow.astro`

- Purpose: shared cluster for string badges or structured badge items.
- Main props: `items`, `className`.
- Use when: page intros, CTA bands, and cards need small metadata without bespoke markup.

### `CardPanel.astro`

- Purpose: generic surface wrapper for panels and non-media cards.
- Main props: `as`, `heading`, `headingLevel`, `eyebrow`, `summary`, `icon`, `actions`, `tone`, `interactive`, `selected`, `href`, `external`, `className`.
- Tones: `default`, `muted`, `soft`, `accent`, `callout`.
- State surface: emits `data-card-state` and interactive hover/focus treatment.
- Use when: a route needs a content panel, route card, policy card, trust card, or selected information surface.

### `NoticeBlock.astro`

- Purpose: shared alert/notice surface.
- Main props: `title`, `body`, `eyebrow`, `tone`, `role`, `action`, `actions`.
- Tones: `info`, `important`, `success`, `error`.
- Use when: privacy notes, urgent guidance, launch notes, and status-like information need explicit visual treatment.

### `AccordionGroup.astro`

- Purpose: reusable disclosure/accordion primitive built on native `details/summary`.
- Main props: `groupId`, `items`, `className`.
- Item shape: `question`, `answer`, optional `open`.
- Use when: a route needs expandable public answers without inventing custom JS disclosure state.

### `FormField.astro`

- Purpose: canonical text, email, select, and textarea field wrapper.
- Main props: `control`, `id`, `name`, `label`, `type`, `options`, `selectPlaceholder`, `helper`, `error`, `required`, `disabled`, `autocomplete`, `value`, `rows`.
- State surface: emits `data-field-state`, wires `aria-invalid` and `aria-describedby`.
- Use when: a route needs helper text, validation messaging, or consistent control spacing.

### `CheckboxField.astro`

- Purpose: shared checkbox row with optional supporting hint copy.
- Main props: `id`, `name`, `label`, `hint`, `checked`, `disabled`, `value`.

### `CtaBand.astro`

- Purpose: shared section-level conversion surface.
- Main props: `eyebrow`, `title`, `summary`, `actions`, `badges`, `note`, `headingLevel`, `className`.
- Use when: a route needs a stronger closing conversion block than a plain inline action row.

## Composed components kept as route-facing aliases

### `ActionCard.astro`

- Built on `CardPanel`.
- Use when: a full card is the interactive link target.

### `SessionSummaryCard.astro`

- Built on `CardPanel`, `Badge`, `ActionCluster`, and shared icon delivery.
- Use when: a recurring session needs summary copy plus text-link actions.

### `ProgrammeCard.astro`

- Built on `CardPanel`, `BadgeRow`, `ActionCluster`, `MediaPicture`, and `DisclosureNote`.
- Use when: a programme overview needs image-led card composition.

### `FaqGroup.astro`

- Thin alias over `AccordionGroup`.
- Use when: the route is semantically a public FAQ set and should keep that name in route code.

### `SupportForm.astro`

- Rebuilt on `CardPanel`, `NoticeBlock`, `FormField`, `CheckboxField`, and `Button`.
- Use when: the standard enquiry route is needed.

## Representative refactors completed in Prompt 12

- `PageIntro`, `FeatureSplit`, `HomeHero`, `EmptyState`, and `SiteFooter` now use shared action composition instead of handwritten CTA rows.
- `About`, `Privacy`, `Safeguarding`, `Sessions`, `Programme detail`, and `Get Involved` now use `CardPanel` instead of repeated `detail-panel` markup.
- `/system/components/` is the dedicated internal harness route for component-state validation.

## Deliberate non-goals

- No route-specific variants were added just to satisfy one page.
- Media-heavy cards remain composed wrappers instead of forcing `CardPanel` to own image layout.
- No component owns data fetching; all components remain content-driven render surfaces.
