# CI Quality Gates

Date: 2026-04-23

## Workflow

CI entry point:

- `.github/workflows/site-quality.yml`

The workflow runs against `site/` only. It does not treat `source/blurpint/` as a second application.

## Blocking Job

Job name:

- `Blocking Quality Gates`

Execution order:

1. `npm ci`
2. `npx playwright install --with-deps chromium`
3. `npm run ci`

`npm run ci` expands to:

1. `npm run validate`
2. `npm run test:e2e`

`npm run validate` expands to:

1. `npm run format:check`
2. `npm run lint:eslint`
3. `npm run check`
4. `npm run test:unit`
5. `npm run build`

Why this order:

- Formatting fails first because it is the cheapest fix.
- Linting runs before type/content checks to catch obvious mistakes quickly.
- `astro check` validates the mixed Astro plus TypeScript surface.
- Unit tests guard core logic without browser overhead.
- Build validation confirms the bridged legacy/public pipeline still works.
- Playwright runs last because it is the slowest and exercises the built preview shape.

## Advisory Job

Job name:

- `Advisory Dependency Audit`

Command:

- `npm run audit:advisory`

This job is intentionally non-blocking because npm audit output can shift with transitive tooling dependencies even when application behavior has not changed.

Current baseline after prompt 07:

- `npm run audit:advisory` reports 6 moderate findings.
- The current fixes require breaking upgrades to Astro or the checker stack, so they are tracked as advisory rather than blocking.

## Artifacts

When browser tests fail, CI uploads:

- `site/output/playwright`

That keeps screenshots, videos, and the HTML report attached to the failed run without polluting git.

## Local Mirror

For local parity with CI:

1. `cd site`
2. `npm ci`
3. `npm run test:e2e:install`
4. `npm run ci`

## Maintenance Rule

Prompt 08 onward should update the blocking pipeline whenever a new permanent quality gate becomes part of the engineering contract. Temporary one-off scripts do not belong in CI.
