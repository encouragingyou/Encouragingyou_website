# Prompt 37 - Accessibility Evidence and Known Limitations

## Scope

This audit covers the live public site in `site/` after Prompts 33-37.
It is intentionally narrower than a formal independent accessibility audit.
The objective is to record what the repo can honestly support in a public Accessibility Statement today.

## Canonical sources

- `site/src/content/accessibilityStatement/default.json`
- `site/src/pages/accessibility/index.astro`
- `site/src/components/forms/SupportForm.astro`
- `site/src/lib/client/site-behavior.js`
- `site/src/layouts/BaseLayout.astro`
- `site/tests/accessibility-page.test.mjs`
- `site/tests/e2e/contracts/accessibility-route.spec.mjs`
- shared route, form, shell, and responsive checks already in `site/tests/` and `site/tests/e2e/`

## Evidence used for the launch statement

### Structure and navigation

- the shared shell provides skip links, breadcrumb support, and visible page structure
- navigation and disclosure behavior are already covered by the route-family and shell Playwright suites
- the mobile menu and FAQ/disclosure interactions have keyboard-safe state handling rather than hover-only behavior

### Forms and feedback

- the live enquiry system uses explicit labels, helper text, visible validation, first-invalid-field recovery, and no-JavaScript confirmation fallback
- the new `accessibility-feedback` surface is a dedicated secure route into the existing server-side enquiry flow rather than a `mailto:` shortcut
- point-of-collection privacy text is shown before submit and stays synchronized through shared content models

### Motion and client behavior

- reduced-motion preferences are respected in the shared client behavior layer
- launch behavior avoids non-essential third-party embeds and avoids a default interactive map on the Contact route
- helper/status messages now come from canonical content rather than route-local strings

### Validation evidence

- `astro check`
- unit coverage for the route contract and microcopy alignment
- Playwright coverage for the new Accessibility Statement route plus the existing responsive, shell, and form journeys

## Launch posture recorded in the statement

- working standard target: `WCAG 2.2 AA`
- assessment posture: self-evaluation
- formal audit posture: no independent audit published
- response route: dedicated accessibility feedback form plus the public email fallback

## Known limitations that remain explicit

1. The repo does not justify a claim of complete compliance or an independent audit outcome.
2. External destinations remain outside the main site runtime:
   - Instagram
   - email applications opened from public email links
   - calendar applications that open `.ics` files
   - any future public directions/map service
3. The launch build does not publish a full assistive-technology compatibility matrix by browser/device combination.
4. Calendar downloads are practical helpers, but the post-download experience depends on the calendar app the visitor uses.

## What the statement deliberately does not claim

- no blanket claim of "fully accessible"
- no claim of named assistive-technology support combinations that are not evidenced in the repo
- no claim that third-party platforms inherit the same accessibility posture as the main site
- no promise of an interactive accessibility widget or automated remediation overlay

## Change-control triggers

The statement should be reviewed when any of the following change:

- a new public form, embed, download, or processor is added
- a public directions link or interactive map goes live
- a formal accessibility audit is commissioned or published
- a new known limitation is confirmed on the live build
- core keyboard, motion, form, media, or shell behavior changes

## Output

- Canonical statement content: `site/src/content/accessibilityStatement/default.json`
- Production route: `site/src/pages/accessibility/index.astro`
- Dedicated accessibility intake surface: `site/src/content/formSurfaces/default.json`
