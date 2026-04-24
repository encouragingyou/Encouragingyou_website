# Risk Register

Date: 2026-04-23

| Risk | Current status | Why it matters | Mitigation in prompt 06 | Next owner |
| --- | --- | --- | --- | --- |
| Bridged legacy routes could drift from structured content | Open | Prototype HTML still contains hardcoded copy and shell markup | Legacy pages are explicitly classified as bridged, not canonical, and later prompts must replace them route by route | Prompts 18, 24-26, 29, 34, 35 |
| Copied public assets could be edited by hand | Open | `site/public/` now contains synced prototype assets | Sync script and bridge contract define copied assets as derived outputs only | Prompts 07 and 10 |
| New Astro home could link to unresolved pages | Reduced | Structured nav already pointed at future routes | Prompt 06 added minimal Astro-owned routes for the currently linked placeholders | Prompts 19-23, 27, 30-37 |
| Playwright could accidentally keep validating the prototype instead of the new app | Closed for prompt 06 | That would hide runtime-integration regressions | Playwright web server now boots Astro, not the prototype preview server | Prompt 07 onward |
| Session routes still rely on prototype CSS and JS | Open | Bridged HTML needs prototype assets to remain functional | Asset bridge keeps them available until the Astro replacements land | Prompts 24-26 |
| Legal and policy routes are only migration-safe placeholders | Open | They are routable, but not production-complete | Placeholder ownership is explicit; future prompts must replace the copy with real policy content | Prompts 35-37 |
| Sitemap and robots are still prototype-derived | Open | Search metadata is not yet generated from canonical Astro routes | Files are copied intentionally for continuity and marked for later replacement | Prompt 40 |
