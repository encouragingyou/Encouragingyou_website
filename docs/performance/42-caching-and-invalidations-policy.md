# Prompt 42 - Caching And Invalidations Policy

## Canonical Sources

- `site/src/lib/performance/policies.js`
- `site/src/middleware.ts`
- `site/scripts/validate-performance-budgets.mjs`

## Runtime HTML Policy

The current standalone launch runtime uses a deliberately conservative HTML policy:

- Public HTML routes: `Cache-Control: public, max-age=0`
- Secure enquiry API: `Cache-Control: no-store`

This keeps browser caching revalidation-first across marketing, trust, editorial, and route-family detail pages. It is intentionally simple and avoids stale-truth drift on contact, privacy, safeguarding, and legal surfaces.

`site/src/middleware.ts` now owns the HTML response header on server-rendered routes. The build validator also fetches the live standalone server and fails if sentinel routes stop returning the expected HTML cache header.

## Deployment Contract For Static Assets

The static asset policy is codified in `site/src/lib/performance/policies.js` even though the local standalone preview does not currently stamp every static file class with differentiated headers:

- Hashed client assets: `public, max-age=31536000, immutable`
- Fonts: `public, max-age=604800, stale-while-revalidate=86400`
- Curated media under `/images/` and `/icons/`: `public, max-age=604800, stale-while-revalidate=86400`
- Calendar downloads: `public, max-age=3600, must-revalidate`
- Discovery files (`robots.txt`, `sitemap.xml`): `public, max-age=3600, must-revalidate`
- Social preview assets: `public, max-age=86400, must-revalidate`
- Favicon: `public, max-age=86400, must-revalidate`

This is the launch delivery contract for the eventual fronting platform or CDN.

## Invalidation Rules

### HTML

- Revalidate on every browser request
- Do not cache-bust route URLs just to invalidate page truth

### Hashed CSS and JS

- Let the build hash invalidate the file automatically
- No manual purge needed if the hashed filename changes

### Curated media, fonts, and social previews

- File paths are stable, not hashed
- Deployments must purge `/images/`, `/icons/`, `/fonts/`, and `/social/` when those files change
- This is acceptable because the launch media set is small and centrally generated

### Calendar and discovery files

- Regenerate on build
- Purge `/calendar/`, `/robots.txt`, and `/sitemap.xml` on release

## Local And CI Parity

The budget validator does not trust filesystem output alone. It boots the real standalone server from `dist/server/entry.mjs`, requests the sentinel route set, and records:

- rendered HTML size
- linked CSS and JS sizes
- eager image count
- font preload count
- actual `Cache-Control` header

That keeps the caching conversation grounded in what the launch runtime really serves.
