# Prompt 40 - Sitemap and Robots Policy

Prompt 40 retires the legacy prototype `robots.txt` and `sitemap.xml` copies. The live discovery surface is now generated from canonical route data.

## Canonical inputs

- `site/src/content/seo/default.json`
- `site/src/content/discovery/default.json`
- `site/src/lib/content/discovery.js`
- `site/src/content/pageDefinitions/launch.json`
- `site/src/content/updatesFeed/default.json`

## Sitemap policy

Only include URLs that are:

- canonical
- indexable
- status-200 public routes
- intended for search discovery

Current sitemap inclusion covers:

- public launch routes such as home, about, programmes, sessions, get involved, volunteer, partner, contact, and safeguarding
- indexable programme and session detail routes
- the Events & Updates index
- editorial detail routes only when `indexVisible` is true

Current sitemap exclusion covers:

- `noindex` trust/legal routes: `/privacy/`, `/cookies/`, `/accessibility/`, `/terms/`
- the custom not-found surface
- internal QA routes such as `/system/components/`
- hidden transport endpoints such as `/api/`
- any future editorial detail route with `indexVisible: false`

## `lastmod` policy

`lastmod` is intentionally omitted.

Reason:

- editorial dates are trustworthy for some items, but the site does not yet maintain a uniform, route-wide freshness ledger
- a partial `lastmod` strategy would imply stronger freshness guarantees than the current content system can prove consistently

## Robots policy

`robots.txt` is minimal on purpose:

- `Allow: /`
- `Disallow: /api/`
- `Disallow: /system/`
- canonical sitemap declaration

This file is not used as a secrecy layer. Search exclusion for public pages remains page-level through canonical metadata and `robots` directives.

## Generation path

- `npm run discovery:generate`
- writes `site/public/robots.txt`
- writes `site/public/sitemap.xml`

## Validation path

- `npm run discovery:validate`
- compares generated files to the canonical route inventory
- confirms social-preview asset coverage for live route families
- confirms the current `lastmod` omission policy has not drifted
