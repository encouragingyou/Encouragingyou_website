# Prompt 51 - CMS Scope and Mutation Boundaries

## Decision

The CMS will be a **decoupled editorial system for approved text and metadata only**.

It is not allowed to become:

- a page builder
- a block composer
- a template switcher
- a theme or token editor
- a route generator
- a runtime-config editor
- an embed/HTML/JS injection surface

## Canonical Contract

The machine-readable scope contract now lives in:

- `site/src/content/cmsScope/default.json`
- `site/src/lib/cms/scope.js`
- `site/src/lib/cms/publication-contract.js`
- `site/scripts/validate-cms-scope.mjs`

Prompt 52 should extend those files instead of creating a parallel CMS model.

## What Editors May Change

Editors are intentionally limited to content the public site already knows how to render:

- short plain text such as labels, headings, and CTA text
- long plain text such as summaries and paragraph copy
- tightly constrained rich text for fixed legal/editorial body sections
- repeatable list items within fixed templates such as FAQs, cards, and callouts
- alt text and approved metadata text
- internal route references through route pickers

## What Editors May Not Change

These remain outside CMS scope:

- component ordering
- section ordering
- layout regions
- templates and route composition
- design tokens and motion rules
- raw HTML, CSS, or JavaScript
- arbitrary iframes or third-party embeds
- route creation or deletion
- analytics mode and event wiring
- security headers, CSP, request-guard policy
- environment variables, secrets, or deployment settings

## Ownership Classes

### `client-editable`

Used for ordinary approved public copy:

- page intros
- section summaries
- CTA labels
- FAQs
- programme and session descriptions
- selected support and reassurance snippets

### `operator-controlled`

Used where a text or metadata field changes trust, legal truth, publication state, or routing:

- legal and policy copy
- safeguarding copy
- public contact identifiers
- publication status and dates
- SEO snippets
- external destinations
- route-sensitive form helper text
- session operational metadata

### `developer-owned`

Used for presentation and runtime concerns:

- template composition
- structural layout
- derived state engines
- schema builders
- recurring schedule logic
- secure form runtime
- admin/public trust boundaries

## Allowed Editorial Primitives

| Primitive | Use |
| --- | --- |
| `short-plain-text` | labels, headings, concise helper text |
| `long-plain-text` | summaries and paragraph-length copy |
| `constrained-rich-text` | legal/editorial body sections with a tiny allowlist |
| `repeatable-list` | FAQs, card lists, proof lists, callouts |
| `seo-snippet` | title/description-style metadata |
| `alt-text` | approved media alt text or captions |
| `route-reference-picker` | internal destination selection |
| `external-link-allowlist` | operator-managed external destinations only |
| `publication-control` | publish/archive/revert state, dates, and route identity |
| `developer-locked` | explicit non-editable boundary |

## Link Policy

End-client editors do not get free-text URL inputs.

- Internal links must use route pickers.
- External links must use operator-managed allowlists.
- Mailto, complaint, and other trust-critical destinations remain operator-controlled.

## Why This Boundary Is Necessary

Prompts 01-50 built a tightly governed public site with strong trust cues, legal truth, accessibility coverage, and deployment controls. If the CMS were allowed to edit structure or runtime behavior, it would reopen risks that the launch sequence already spent 50 prompts closing:

- broken responsive layouts
- inaccurate safeguarding or privacy content
- uncontrolled external links
- route drift and SEO drift
- accidental analytics/security regressions

This prompt locks those red lines before any schema or admin UI work begins.
