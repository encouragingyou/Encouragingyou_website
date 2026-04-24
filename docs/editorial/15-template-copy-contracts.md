# Prompt 15 - Template Copy Contracts

Prompt 15 makes editorial intent explicit per template through `editorialSystem.templateContracts`.

## What the contracts define

Each template contract records:

- the editorial goal
- the required content slots
- the reassurance needs
- the placeholder rule

Coverage now exists for every template in the runtime, including:

- home
- about
- programme index/detail
- session index/detail
- updates index
- get involved
- volunteer and partner detail
- contact
- safeguarding
- legal
- not found

## Why this matters

Before prompt 15, some routes had technically valid content structures but still allowed internal or migration-oriented copy to leak into public text.

The contracts now make three things explicit:

- what every page type must help a visitor do
- what reassurance must be visible on that page type
- what kind of placeholder behavior is acceptable for that page type

## Future prompt checklist

The concise editorial checklist for later page-building work now lives in `editorialSystem.futurePromptChecklist`.

Use it as the default gate before landing new public copy:

1. Lead with the visitor task.
2. Keep headings and summaries controlled.
3. Make unknown facts explicit instead of guessing.
4. Keep privacy and safeguarding near the action.
5. Avoid pity framing, hype, and generic charity language.
6. Do not mention prompts, migrations, runtimes, or tooling.
7. Use route-specific CTA labels.
8. Leave out any unverified claim.

## Prompt 15 implementation touchpoints

The contracts now influence live runtime behavior through:

- `site/src/lib/content/editorial-guidance.ts`
- `site/src/lib/content/site-content.ts`
- `site/src/components/forms/SupportForm.astro`
- `site/src/components/site/LaunchPlaceholder.astro`
- `site/scripts/validate-editorial-content.mjs`
