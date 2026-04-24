# Homepage Authoring Guide

Use this guide when updating homepage content after Prompt 17.

## Start with content, not the route

Homepage authoring now starts in `site/src/content/homePage/default.json`.

Edit:

- `hero` for the headline, summary, badges, and primary CTA pair
- `actions` for reusable homepage action definitions
- `conversionStack` for the main/supporting CTA hierarchy
- `sections` for section order and section-level content
- `stateRules` for truth-sensitive fallback behavior

Do not hardcode route copy directly inside `site/src/pages/index.astro` unless a new pattern genuinely cannot be represented by the existing schema.

## Section authoring rules

- `quick-actions`: keep these task-first and high-frequency.
- `trust-strip`: every trust item should route somewhere distinct.
- `live-sessions`: never invent future dates or availability.
- `programme-teasers`: keep the slug list explicit so support pillars do not disappear silently.
- `page-teaser`: use this for short route handoffs such as About.
- `feature-split`: use this when a section needs media plus a narrative body.
- `updates-surface`: keep the surface truthful whether the feed is empty, sparse, or populated.
- `faq-cluster`: pair public answers with one support action, not a new CTA pile.
- `contact-panel`: treat the form as the primary action surface; supporting links stay secondary.

## Adding or changing sections

1. Update the section record in `homePage/default.json`.
2. Extend the typed union in `site/src/lib/content/site-content.ts` if the shape changes.
3. Add or update the rendering branch in `site/src/pages/index.astro`.
4. Add or update Playwright coverage if the visible contract changes.

## Avoid these regressions

- Do not reintroduce compatibility-only homepage fields in the runtime.
- Do not move quick actions back into shell navigation config.
- Do not collapse trust-strip cards into one blanket safeguarding destination.
- Do not add duplicate exact CTA labels above the fold without checking Playwright selectors.
- Do not pad the updates surface with invented news or duplicate session entries.
