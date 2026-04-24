# Environment Matrix

Date: 2026-04-23

## Current Rule

Prompt 07 does not introduce any required secrets. The site can build and test with zero private environment variables.

## Environment Files

- `site/.env.example`: local baseline and future reserved variables
- `site/.env.preview.example`: deployment-preview template

Real `.env*` files are ignored.

## Variable Contract

| Variable | Used now | Local | Preview | Production | Secret | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `SITE_URL` | Yes | Optional | Required | Required | No | Used by `astro.config.mjs` for canonical site origin and future metadata generation |
| `PLAYWRIGHT_BASE_URL` | Yes | Optional | Optional | N/A | No | When set, Playwright targets an already-running server instead of booting preview itself |
| `PLAYWRIGHT_PORT` | Yes | Optional | Optional | N/A | No | Only used when Playwright boots its own preview server |
| `HOST` | Legacy-only | Optional | Optional | N/A | No | Used only by `npm run preview:prototype` |
| `PORT` | Legacy-only | Optional | Optional | N/A | No | Used only by `npm run preview:prototype` |
| `ENQUIRY_STORAGE_DIR` | Yes | Optional | Optional | Optional | No | When unset, the secure enquiry queue writes to `site/var/enquiries` relative to the process working directory |
| `PUBLIC_ANALYTICS_MEASUREMENT_ID` | Reserved | Leave unset | Future | Future | No | Reserved for prompt 43 client-side analytics |
| `CMS_READ_TOKEN` | Reserved | Leave unset | Future | Future | Yes | Reserved for future CMS integration if one is approved |

## Context Matrix

| Context | Required values now | Notes |
| --- | --- | --- |
| Local development | None | `SITE_URL` falls back to the public production domain unless overridden; enquiry records default to `site/var/enquiries` |
| Local Playwright against local preview | None | Default behavior; Playwright boots its own built preview |
| Local Playwright against another host | `PLAYWRIGHT_BASE_URL` | Useful for debugging an already-running server |
| Deployment preview | `SITE_URL` | Set this to the preview origin before build |
| Production | `SITE_URL` | Set `ENQUIRY_STORAGE_DIR` if the deployment working directory is not a suitable durable queue location |

## Secret Discipline

1. Do not commit real `.env` files.
2. Do not expose secret values through `PUBLIC_*` names.
3. Reserved variables stay undocumented in code paths until their feature prompt exists.
4. If a future feature needs server-side secrets, keep them in deployment settings and document them here before use.
