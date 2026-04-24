# Workspace Topology

Date: 2026-04-23

## Working Rule

`site/` is the only application runtime. The rest of the repo exists to support migration, documentation, and source reference.

## Repo-Level Responsibilities

| Path | Responsibility | Notes |
| --- | --- | --- |
| `site/` | Production Astro app, tests, scripts, and app-local tooling | All build, lint, check, and browser QA entry points run here |
| `source/blurpint/` | Legacy migration source | Not the live runtime |
| `docs/` | Architecture, migration, QA, and developer decision trail | Handovers and prompt outputs stay here |
| `prompt/` | Task archive and execution checklist | Working instructions only |
| `secret/` | User-owned private material | Intentionally ignored |

## `site/` Topology

| Path | Responsibility | Ownership rule |
| --- | --- | --- |
| `src/pages/` | Route entry points owned by Astro | Public URLs should resolve here or through bridged `public/` HTML |
| `src/layouts/` | Shared page frames | Layout concerns only |
| `src/components/site/` | Global shell and page-level scaffolding | Header, footer, shell, placeholders |
| `src/components/sections/` | Reusable multi-element sections | Page composition building blocks |
| `src/components/ui/` | Small reusable UI primitives | Cards, buttons, headings, notices |
| `src/components/forms/` | Form views only | Delivery logic stays outside the component |
| `src/content/` | Canonical editorial and structured content | JSON collections remain the source of truth |
| `src/data/generated/` | Generated snapshots derived from source systems | Never hand-edit |
| `src/lib/content/` | Content assembly and route-view models | Convert structured content into page props |
| `src/lib/domain/` | Business rules with no DOM coupling | Scheduling and domain calculations |
| `src/lib/state/` | Form and route state machines | No presentation markup here |
| `src/lib/client/` | Browser-only enhancement bootstraps | DOM wiring only |
| `src/lib/legacy/` | Bridge manifest for prototype-derived routes/assets | Temporary until route-by-route replacement finishes |
| `src/lib/types/` | Shared UI and domain types | Central home for cross-cutting TypeScript shapes |
| `src/styles/` | Global CSS layers and tokens | Prompt 08 onward extends this stack |
| `public/` | Static output served as-is | Includes bridged legacy HTML and copied prototype assets |
| `scripts/` | Deterministic build and migration scripts | Must stay idempotent and non-interactive |
| `tests/` | Unit tests plus browser tests | `tests/*.test.mjs` for unit, `tests/e2e/**` for Playwright |
| `output/` | Generated QA artifacts | Ignored, never committed |

## Boundary Rules

1. Editorial facts belong in `src/content/**`, not in Astro templates.
2. Route assembly belongs in `src/lib/content/**`, not in leaf UI components.
3. Business logic belongs in `src/lib/domain/**` or `src/lib/state/**`, not in browser event handlers.
4. Browser-only behavior belongs in `src/lib/client/**`, not in content or domain modules.
5. Prototype carry-over lives in `src/lib/legacy/**` plus `public/**` until a prompt explicitly replaces it.

## Language Standard

- `*.astro` for route/layout/component markup.
- `*.ts` for new shared logic and shared types.
- Existing `*.js` modules remain allowed where they already work, but any touched shared logic should move toward typed `*.ts` instead of growing the mixed-language surface.
- `*.mjs` remains the standard for Node-side scripts and config files.

## Import Convention

- Use relative imports for same-folder and same-feature references.
- Use `@/*` or the scoped aliases (`@components/*`, `@lib/*`, `@content/*`, `@styles/*`, `@data/*`) for cross-slice imports that would otherwise climb multiple directory levels.
- Do not import from `public/` or `output/`.

## Naming Convention

- Components, layouts, and shared UI types: `PascalCase`.
- Scripts, state modules, and domain helpers: `kebab-case` filenames.
- Structured content IDs and slugs: lower-case kebab case.
- Generated files should include `generated` in the path, not in the filename.
