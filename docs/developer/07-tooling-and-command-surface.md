# Tooling And Command Surface

Date: 2026-04-23

## Package Manager Contract

- Node version is pinned in `site/.nvmrc`.
- `site/package.json` declares the npm version via `packageManager`.
- `site/.npmrc` sets `workspaces=false` so contributors do not need to remember `--workspaces=false` on every command in this environment.

## Tooling Added In Prompt 07

- ESLint flat config: `site/eslint.config.mjs`
- Prettier config: `site/.prettierrc.json`
- Editor defaults: repo-root `.editorconfig`
- Environment examples: `site/.env.example`, `site/.env.preview.example`
- CI workflow: `.github/workflows/site-quality.yml`

## Command Surface

Run all commands from `site/`.

| Command | Purpose | Blocking |
| --- | --- | --- |
| `npm ci` | Install exact dependencies from `package-lock.json` | Yes |
| `npm run dev` | Sync bridged legacy assets and boot Astro dev server | No |
| `npm run build` | Sync legacy inputs, regenerate parity data, and produce a static build | Yes |
| `npm run preview` | Preview the built Astro output | No |
| `npm run preview:prototype` | Compare against the static legacy prototype only | Advisory |
| `npm run sync:legacy` | Copy prototype assets and bridged HTML into `public/` | Support |
| `npm run routes:parity` | Regenerate the route/asset bridge matrix | Support |
| `npm run lint` | ESLint plus Prettier check | Yes |
| `npm run lint:eslint` | ESLint only | Yes |
| `npm run format` | Apply Prettier formatting | No |
| `npm run format:check` | Check formatting without changing files | Yes |
| `npm run check` | Astro type/content validation | Yes |
| `npm run test:unit` | Node unit tests | Yes |
| `npm run test:e2e:install` | Install the local Playwright browser | Support |
| `npm run test:e2e` | Browser QA against the built Astro preview | Yes |
| `npm run validate` | Fast blocking pipeline: format check, lint, check, unit tests, build | Yes |
| `npm run ci` | Full blocking pipeline: `validate` plus Playwright | Yes |
| `npm run audit:advisory` | Dependency audit for review, not as a merge blocker | Advisory |

## Expected Contributor Flow

1. `cd site`
2. `npm ci`
3. `npm run test:e2e:install`
4. `npm run dev`

Before handing work off:

1. `npm run validate`
2. `npm run test:e2e` if UI, routing, forms, navigation, or bridged content changed

## Formatting And Linting Scope

- Prettier ignores generated output, copied public assets, and build artifacts.
- ESLint ignores generated output, copied public assets, build artifacts, and `src/data/generated/**`.
- `astro check` remains the type/content authority; ESLint is intentionally non-type-aware to keep local feedback fast.
