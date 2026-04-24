# Prompt 42 - Budget Matrix And Route Tier Targets

## Canonical Sources

- `site/src/lib/performance/policies.js`
- `site/scripts/validate-performance-budgets.mjs`
- `site/src/data/generated/performance-budget-report.json`

Prompt 42 turns performance into an explicit contract instead of an implied preference. The canonical budget source now lives in `site/src/lib/performance/policies.js`, and `site/scripts/validate-performance-budgets.mjs` measures the built site against that contract by booting the real standalone server and fetching representative public routes.

## Shared Asset Ceiling

- Stylesheets per page: `1` max
- Module scripts per page: `1` max
- Font preloads per page: `1` max
- Third-party requests in the launch baseline: `0`
- Astro-generated client media under `dist/client/_astro`: `0`
- Shared CSS ceiling: `96,000` raw bytes
- Shared JS ceiling: `16,000` raw bytes

Current measured baseline from `site/src/data/generated/performance-budget-report.json`:

- Shared CSS: `89,231` raw bytes, `13,925` gzip bytes
- Shared JS: `10,010` raw bytes, `3,689` gzip bytes
- Font preload count on sentinel routes: `1`
- Astro-generated client media: `0`

## Route Tiers

### First impression

- Routes: `/`, `/about/`
- HTML ceiling: `52,000` bytes
- Eager image count: `1`
- Current measured range: `31,738` to `49,905` bytes

### Illustration-heavy

- Routes: `/programmes/`, programme detail routes, `/get-involved/`, `/partner/`, `/volunteer/`
- HTML ceiling: `58,000` bytes
- Eager image count: `1`
- Current measured range on sentinels: `34,645` to `42,062` bytes

### Live session

- Routes: `/sessions/`, session detail routes
- HTML ceiling: `56,000` bytes
- Eager image count: `0`
- Current measured range on sentinels: `25,933` to `29,746` bytes

### Utility and trust

- Routes: `/contact/`, `/privacy/`, `/cookies/`, `/accessibility/`, `/terms/`, `/safeguarding/`, `/safeguarding/child/`, `/safeguarding/adult/`
- HTML ceiling: `52,000` bytes
- Eager image count: `0`
- Current measured sentinel values: `39,982` and `41,511` bytes on `/privacy/` and `/contact/`

### Editorial

- Routes: `/events-updates/` and editorial detail routes
- HTML ceiling: `56,000` bytes
- Eager image count: `1`
- Current measured range on sentinels: `19,436` to `26,172` bytes

## Sentinel Set

The validator protects a deliberate route set rather than pretending every page needs the same threshold:

- `/`
- `/about/`
- `/programmes/`
- `/programmes/community-friendship/`
- `/sessions/`
- `/sessions/cv-support/`
- `/get-involved/`
- `/contact/`
- `/privacy/`
- `/events-updates/`
- `/events-updates/community-events-and-workshops/`

This sentinel set is small enough to keep CI fast, but broad enough to catch regressions in first impression, illustration-heavy, trust, live-session, and editorial route families.
