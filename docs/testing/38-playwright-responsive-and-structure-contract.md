# Prompt 38 - Playwright Responsive and Structure Contract

## Viewport Matrix

Prompt 38 reuses the shared viewport contract:

- Mobile: `390x844`
- Tablet: `834x1194`
- Laptop: `1280x800`
- Desktop: `1536x960`
- Wide desktop: `1728x1117`

## Route Matrix

The responsive trust sweep now checks:

- `/`
- `/about/`
- `/volunteer/`
- `/partner/`
- `/contact/`
- `/cookies/`
- `/accessibility/`
- `/terms/`

## What Must Hold Across Viewports

- no horizontal overflow
- disclosure notes remain visible where required
- footer sitewide disclosure remains available on shell routes
- privacy/trust helper surfaces remain readable on involvement/contact routes
- proof-boundary and disclosure surfaces do not collapse or disappear on narrow screens

## Structure Rules

The governance suite also protects:

- single-H1 behavior on legal routes
- shell landmark order
- skip-link entry
- no-JS disclosure visibility
- reduced-motion stability for trust/legal entry points

## Extension Rule For Later Prompts

If Prompt 39 or later introduces new disclosure-bearing route families, add them to the `@trust` matrix instead of creating isolated one-off smoke tests.
