# Prompt 15 - Placeholder Governance

Prompt 15 formalizes how incomplete content is shown in public without pretending it is final.

## Core rule

Unknown or unapproved facts must be handled in one of three ways:

1. Publish now
   The route, safe summary, and confirmed next step can be shown publicly.

2. Awaiting confirmation
   Details can be named as pending, but not guessed.

3. Hidden until verified
   Trust-sensitive specifics stay out of public copy entirely until confirmed.

## Structured implementation

The governing data now lives in `editorialSystem.placeholderPolicies`.

Policies currently cover:

- `outline-trust-critical`
- `outline-standard`
- `placeholder-trust-critical`

`site/src/lib/content/editorial-guidance.ts` resolves the right policy from `contentStatus` plus `trustCritical`.

## Live template use

`site/src/components/site/LaunchPlaceholder.astro` now renders a shared status block driven by the editorial system.

Placeholder routes such as:

- `/partner/`
- legal placeholder routes

now show:

- what is safe to publish now
- what is still waiting for approval
- what is intentionally withheld until verified

This replaces vague “coming soon” behavior with explicit public-facing governance.

## Validation rule

`site/scripts/validate-editorial-content.mjs` now blocks invisible placeholder habits and internal build jargon from slipping into publishable content JSON.

The validator specifically rejects phrases such as:

- `later prompts`
- `astro-owned`
- `new runtime`
- `migration-safe`
- `coming soon`
- `lorem ipsum`
- `todo`
- `tbd`
