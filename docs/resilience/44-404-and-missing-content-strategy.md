# Prompt 44 - 404 And Missing Content Strategy

## 404 Principles

- A missing URL must stay visibly missing. The site should not silently redirect every broken route to Home.
- Recovery should prioritize the routes most likely to help someone continue safely.
- Tone must stay calm, direct, and non-jokey.

## Production 404 Contract

Route: `site/src/pages/404.astro`

Model: `getNotFoundModel()` in `site/src/lib/content/site-content.ts`

Recovery links:

- Home
- Sessions
- Programmes
- Get Involved
- Contact
- Safeguarding

Urgent handling:

- The route keeps the dedicated urgent-help notice from `routePages.default.json`
- Emergency guidance remains explicit: call `999` for immediate danger

## Wrong-Turn Recovery Rules

- Missing static slugs for programme, session, and editorial detail routes fall through to Astro’s 404 handling because only canonical `getStaticPaths()` outputs are built.
- Legacy URLs should only be redirected when parity or cutover work explicitly defines them.
- Unknown URLs should stay 404 so broken or stale shared links remain detectable.

## Missing Content Rules

- Empty editorial index states route to Sessions and Contact rather than pretending updates are delayed.
- Contact keeps Rochdale public while withholding precise venue or map detail until it is relevant and safe to share.
- Media fallback preserves access to the route body even if a compatibility derivative is missing.

## Prompt 45 Implications

Automate:

- 404 status code plus visible recovery links
- no dead-end state after missing route
- no unexpected redirect from a bad route into a successful `200`
