# Prompt 47 - Attack Surface And Trust Boundary Audit

## Runtime perimeter

- Public document routes are served by the Astro 5 Node standalone runtime in `site/`, with launch routes covering homepage, programme/session families, trust/legal routes, updates, and involvement flows.
- Public write endpoints are limited to:
  - `/api/enquiry/`
  - `/api/analytics/`
  - `/api/analytics-preference/`
- Static delivery includes first-party fonts, images, icons, calendar files, robots/sitemap outputs, and generated social preview assets. No third-party script, font, iframe, or analytics vendor is active in the launch build.
- Server-side persistence is file-backed and local to the runtime:
  - enquiries write JSON records into `ENQUIRY_STORAGE_DIR` or `./var/enquiries`
  - aggregate analytics write daily JSON summaries into `ANALYTICS_STORAGE_DIR` or `./var/analytics`

## Untrusted input entry points

- Form POST bodies on `/api/enquiry/` and `/api/analytics-preference/`
- Analytics JSON POST bodies on `/api/analytics/`
- Query strings that drive success/error UI states on contact, safeguarding, and cookie flows
- Request headers used for origin, privacy-signal, and cache/security decisions
- Structured content rendered into metadata, JSON-LD, route copy, cards, notices, and links

## High-sensitivity surfaces

- Enquiry and safeguarding forms are the strongest trust boundary because they can receive personal or sensitive support information.
- Privacy, cookies, accessibility, safeguarding, and terms routes are legal/truth-critical surfaces and should stay browser-revalidating.
- Analytics preference state is privacy-significant even though the data model is aggregate-only.
- Build and CI workflows are operationally sensitive because they control shipped headers, CSP, static artifacts, and dependency updates.

## Current trust model after Prompt 47

- Browser documents, assets, and API responses now receive a shared security-header policy from middleware rather than ad hoc route code.
- CSP is derived from the actual rendered HTML so it tracks the live inline-script surface instead of a guessed allowlist.
- Astro's global `checkOrigin` switch remains off because it blocks legitimate local/preview same-origin form posts in this standalone runtime. The public POST APIs instead own explicit same-origin, content-type, and body-size guards that work in both preview and production-hosted flows.
- Client-side form validation remains UX-only. Final trust stays server-side through allowlists, route/context validation, honeypot, timing checks, and rate limiting.
- All runtime assets remain first-party. External social/contact links exist in content, but there are no external execution origins in the launch app.

## Build and CI exposure points

- `npm run validate` now includes `security:validate`, which boots the built server and checks headers, CSP hashes, inline-attribute constraints, and API guardrails.
- `.github/workflows/site-quality.yml` keeps an advisory dependency job, but it now runs `npm run audit:policy` so unexpected packages/advisories fail even when the known Astro 5 holdovers remain non-blocking.
- The legacy prototype dependency surface is intentionally minimal in `source/blurpint/package.json`; the live risk sits in `site/package.json` and its lockfile, not in the old static reference folder.

## Operational gaps intentionally left explicit

- CSP reporting is not wired to an external report collector yet because no verified reporting endpoint or SIEM target exists in the repo.
- HSTS is emitted only on secure transport. Prompt 48 still needs to make the production host/TLS path authoritative.
- Secret rotation, production inbox/webhook targets, and deployment platform controls remain operational responsibilities for Prompt 48 and later launch prompts rather than guessed code defaults.
