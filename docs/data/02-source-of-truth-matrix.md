# Source-of-Truth Matrix

Date: 2026-04-22

## Principle

Every major domain now has one intended canonical source in `site/src/content/`. The prototype remains a reference, not the editing destination.

## Matrix

| Domain | Canonical source now | Prototype/source inputs replaced | Edit rule | Derived outputs |
| --- | --- | --- | --- | --- |
| Sitewide brand + contact baseline | `site/src/content/siteSettings/default.json` | Scattered header/footer text, metadata fragments, PDF mission/vision statements | Edit global brand and service-area facts here first | Metadata helpers, footer, disclosure defaults |
| Launch scope + trust gates | `site/src/content/launchGovernance/default.json` | None previously structured; scattered in blueprint and audit docs | Edit release scope and blockers here, not in ad hoc notes | QA checklist, planning, launch-readiness logic |
| Page and template inventory | `site/src/content/pageDefinitions/launch.json` | HTML file presence as accidental IA | Edit route intent here before building new pages | Route generation, nav validation, page planning |
| Header/footer/quick actions | `site/src/content/navigation/default.json` | Duplicated header/footer HTML across `source/blurpint/*.html` | Edit nav once here, never across individual page files | Shared shell, footer groups, quick actions |
| Contact methods + form reasons | `site/src/content/contactInfo/default.json` | `mailto:` links and hardcoded `<select>` options in HTML | Edit email, phone, reasons, and urgent guidance here | Contact page, forms, session/help routing |
| Media registry | `site/src/content/mediaLibrary/default.json` | Alt text and asset usage embedded in HTML, plus raw source folders | Add or update asset metadata here; raw artwork stays in `/source/media_attachment` | Image rendering, alt text, disclosure behavior |
| Programme definitions | `site/src/content/programmes/*.json` | Home-page programme cards, PDF programmes list, blueprint categories | Edit programme meaning here, not in page fragments | Programme index/detail pages, home highlights |
| Session definitions | `site/src/content/sessions/*.json` | `site.js` sessions object, session page HTML, `.ics` files | Edit the structured session entry first; regenerate downstream outputs later | Session pages, date labels, `Event` schema, ICS |
| FAQ groups | `site/src/content/faqs/default.json` | Home-page `<details>` content and scattered copy ideas | Edit FAQ groups here so they can be reused | Home, sessions, get involved, contact |
| Involvement pathways | `site/src/content/involvementRoutes/default.json` | Get involved page copy and blueprint pathway notes | Edit pathway intent here first | Get involved hub, volunteer and partner routes |
| Trust signals | `site/src/content/trustSignals/default.json` | Trust strip cards and brief statements | Edit trust wording and verification state here | Trust strips, page trust panels, QA |
| Safeguarding detail | `site/src/content/safeguardingInfo/default.json` | `source/blurpint/safeguarding/index.html` plus brief statements | Edit child/adult branch details and concern route here | Safeguarding page, urgent notices |
| Legal route planning | `site/src/content/legalPages/default.json` | Launch-state inventory for privacy, cookies, accessibility, and terms | Edit legal route state and blockers here | Footer links, release gating |
| Privacy notice runtime | `site/src/content/privacyNotice/default.json` | Old thin privacy page copy | Edit the live privacy route, collection-point inventory, and change-control flags here | `/privacy/`, form privacy notes, Prompt 36 handoff |
| Reusable CTA definitions | `site/src/content/ctaBlocks/default.json` | Hardcoded button labels/hrefs in multiple HTML pages | Edit CTA labels and intents here | Buttons, CTA sections, tracking later |
| Reusable notices | `site/src/content/notices/default.json` | Repeated AI disclosure and inline privacy notes | Edit repeated short notices here | Disclosures, microcopy, form notes |

## Generated and reference-only artifacts

Reference-only prototype inputs:

- `source/blurpint/**`
- `source/media_attachment/**`
- `source/EncouragingYou Website Information .pdf`
- `source/encouragingyou-site-look-and-feel.md`

Generated comparison artifact:

- `site/src/data/generated/imported-blurpint-sessions.json`

Edit policy for generated artifacts:

- do not hand-edit generated files
- rerun the importer or generator instead

## Immediate editing guidance for later prompts

- If a later prompt needs a session fact, start in `site/src/content/sessions/*.json`.
- If it needs a page route or nav decision, start in `pageDefinitions` and `navigation`.
- If it needs a repeated trust statement or disclosure, start in `trustSignals` or `notices`.
- If a fact is unknown, keep it as a placeholder in the canonical content file and log it in docs rather than hardcoding a guess into page templates.
