# Prompt 12 - Composition And Variant Guidelines

## Core rule

Prefer composition over variant growth.

If a new page can be built by combining `CardPanel`, `BadgeRow`, `ActionCluster`, `NoticeBlock`, `AccordionGroup`, and route-specific media/content wrappers, do that instead of adding a fresh one-off component variant.

## What each layer should own

### Primitive layer

Owns:

- spacing, border, radius, shadow, tone, focus, hover, and disabled treatment
- accessibility wiring for common patterns
- lightweight render decisions such as button vs link or input vs select

Does not own:

- route copy
- data loading
- page-specific content hierarchy beyond its own slot structure

### Composed alias layer

Owns:

- route-facing convenience for repeated content structures
- media placement where a card family genuinely needs it

Examples:

- `ActionCard`
- `SessionSummaryCard`
- `ProgrammeCard`
- `FaqGroup`
- `SupportForm`

### Route layer

Owns:

- page order and section strategy
- which card or alert tone to use
- breadcrumb and current-route context
- final copy and action ordering

## When to use each surface

### Use `CardPanel`

- policy cards
- trust cards
- route guidance panels
- selected informational surfaces
- CTA-adjacent panels without image-led layout

### Use `ActionCard`

- when the whole card is the link target
- when the content is intentionally short
- when nested actions would be invalid or distracting

### Use `ProgrammeCard`

- when the panel needs image, disclosure, tags, and a single text CTA

### Use `SessionSummaryCard`

- when time metadata and two text actions are both first-class content

### Use `NoticeBlock`

- when the message must look operational, legal, urgent, or stateful
- not for ordinary body copy that happens to sit in a panel

### Use `CtaBand`

- when a section closes with a major next step
- when actions, supporting badges, and an optional note need one shared shell
- not for every inline action row

## Variant discipline

Allowed variant growth in the current system:

- new semantic tones that can be reused across at least two future routes
- new shared spacing or alignment modifiers that do not change component meaning

Avoid:

- page-name variants such as `card--about` or `cta--volunteer-page`
- variants that only encode copy differences
- variants added just to solve a single breakpoint bug when the layout system should solve it

## Form guidance

- `FormField` should carry label, helper, error, and control wiring.
- `SupportForm` should own the multi-field workflow, status message, and submit transport.
- New forms should reuse the field primitives first, then add a composed form wrapper only if the grouping repeats across routes.

## Disclosure guidance

- Use `AccordionGroup` for public FAQ or expandable guidance content.
- Keep native `details/summary` unless there is a real product requirement that native disclosure cannot satisfy.
- Do not create a separate JS accordion controller for single-route FAQ styling.

## Preview-route guidance

- Use `/system/components/` for deterministic component-state checks.
- Keep fixture copy minimal and obvious.
- Do not turn the preview route into a second style guide with route-specific experiments.

## Prompt 13 implication

The component APIs are now stable enough that Prompt 13 can focus on content ownership and structured loading rather than inventing new UI wrappers for each data source.
