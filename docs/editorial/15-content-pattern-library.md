# Prompt 15 - Content Pattern Library

Prompt 15 captures reusable copy patterns in `site/src/content/editorialSystem/default.json` under `contentPatterns` and `microcopyPatterns`.

## Pattern families

The structured pattern library now covers:

- hero headlines
- reassurance blocks
- CTA microcopy
- session expectation copy
- safeguarding escalation wording
- privacy helper text
- AI illustration disclosure
- placeholder governance
- volunteer/partner/referral invitation language

Each pattern records:

- the context where it applies
- the editorial intent
- the expected structure
- approved moves to keep
- moves to avoid

## Live integrations

Two pattern families are now wired directly into components:

1. Support-form microcopy
   `site/src/components/forms/SupportForm.astro` now receives governed copy for:
   - privacy notice title
   - message helper text
   - updates opt-in label
   - direct-email fallback prefix

2. Session state microcopy
   `site/src/lib/content/site-content.ts` now uses the shared editorial source for:
   - `Schedule update`
   - `Calendar download unavailable`

This keeps public UI labels from drifting into local component one-offs.

## Content clean-up completed in prompt 15

Prompt 15 also removed implementation-language from current public copy.

Structured content no longer tells visitors about:

- Astro ownership
- migration checkpoints
- later prompts
- runtime plumbing

The route copy now talks about what the visitor can do, what is live now, and what is still being confirmed.
