# Prompt 11 Global Shell Architecture

Prompt 11 replaces the thin header/footer wrapper with one route-aware shell system that owns navigation, breadcrumbs, contextual CTAs, skip links, footer support, and shell-level notices.

## Core runtime pieces

| Responsibility | File |
| --- | --- |
| route-aware shell model | `site/src/lib/content/site-shell.ts` |
| shell configuration source of truth | `site/src/content/shellConfig/default.json` |
| top-level layout integration | `site/src/layouts/BaseLayout.astro` |
| header and mobile navigation | `site/src/components/site/SiteHeader.astro` |
| footer and persistent support surface | `site/src/components/site/SiteFooter.astro` |
| skip-link cluster | `site/src/components/site/SiteSkipLinks.astro` |
| breadcrumb, back-link, notice band | `site/src/components/site/ShellWayfinding.astro` |
| shell notice stack | `site/src/components/site/SiteNoticeStack.astro` |

## What the shell now owns

- skip links for content, primary navigation, and footer
- utility navigation for email, Instagram, privacy, and safeguarding
- active primary navigation state
- section-aware header CTA switching
- breadcrumb generation and back-link generation
- shell-level notice injection before page content where route context needs it
- persistent footer support CTA so support is never buried
- no-JS-safe primary navigation behavior with JS only enhancing mobile toggling

## Route classes now proven through the shared shell

- homepage: `/`
- editorial page: `/about/`
- index and detail content routes: `/programmes/`, `/programmes/[slug]/`, `/sessions/`, `/sessions/[slug]/`
- support and involvement routes: `/contact/`, `/get-involved/`, `/volunteer/`, `/partner/`
- trust and legal routes: `/safeguarding/`, `/privacy/`, `/cookies/`, `/accessibility/`, `/terms/`

`/about/` and `/privacy/` are no longer legacy-wrapped routes. Prompt 11 migrates both into Astro so the shell is consistent across all launch route classes.

## State model

Prompt 11 keeps shell state intentionally light:

- server-derived:
  - active route
  - breadcrumb trail
  - back-link
  - contextual header CTA
  - shell notice list
- client-enhanced:
  - mobile menu open/closed
  - focus return to the toggle on escape or outside-click close
  - no-JS fallback by leaving the navigation panel visible unless JS explicitly enhances it

## Why this matters for prompt 12

Prompt 12 can now build reusable buttons, cards, badges, panels, alerts, and form surfaces against one stable shell instead of compensating for route-by-route header and footer differences.
