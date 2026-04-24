# Prompt 36 - Storage and Access Audit

## Scope

This audit covers the launch build in `site/`, the legacy prototype evidence in `source/blurpint/`, and the live privacy/contact/legal configuration introduced in Prompts 31-35.

## Evidence checked

- `site/src/layouts/BaseLayout.astro`
- `site/src/lib/client/site-behavior.js`
- `site/src/pages/api/enquiry.ts`
- `site/src/lib/server/enquiry-service.js`
- `site/src/content/contactInfo/default.json`
- `site/src/content/privacyNotice/default.json`
- `source/blurpint/README.md`
- repo-wide search for cookies, web storage, IndexedDB, analytics tags, pixels, embeds, map integrations, CAPTCHA providers, and consent tooling

## Launch findings

### Active in the public build

1. Standard browser request delivery
   - Same-site HTML, CSS, JS, fonts, images, calendar files, and API responses load through normal browser requests.
   - No tracking cookie, consent cookie, or marketing tag is added by the site code.

2. Same-site enquiry submission handling
   - Form submissions post to `/api/enquiry/`.
   - Abuse defenses use a honeypot field, render-time check, origin/referrer checks, and server-side rate limiting.
   - No client-side cookie, localStorage item, or third-party anti-abuse token is set.

3. Responsive layout and reduced-motion adaptation
   - The shell uses CSS media queries and `window.matchMedia(...)` for viewport-width and reduced-motion behavior.
   - No cross-visit preference record is stored.

### Confirmed absent at launch

- Non-essential cookies
- `localStorage`
- `sessionStorage`
- IndexedDB
- Consent preference cookies or consent records stored on the device
- Analytics platforms, tag managers, session replay, and heatmaps
- Advertising or remarketing pixels
- Interactive map embeds
- Social-feed embeds or social plugins
- Third-party CAPTCHA / anti-abuse tokens
- Third-party font delivery

## Risk interpretation

- The launch build has no non-essential storage/access technology that currently needs a consent banner.
- The only audited device-side behaviors in the live build are communication-delivery, service-essential form transport, and appearance helpers.
- The legal risk would come from future additions being introduced silently. Prompt 36 therefore focuses on change control and registry enforcement rather than a performative banner.

## Output

- Canonical registry: `site/src/content/storageAccess/default.json`
- Production route: `site/src/pages/cookies/index.astro`
- Structured validator sync: `site/scripts/validate-structured-content.mjs`
