# Prompt 19 - Programme Family Template Contract

## Purpose

Programme detail pages now share one reusable template instead of route-local composition.

Primary implementation:

- `site/src/components/sections/ProgrammeDetailTemplate.astro`
- `site/src/components/ui/ProgrammePillarCard.astro`

Current route consumer:

- `site/src/pages/programmes/[slug].astro`

## Template Inputs

`ProgrammeDetailTemplate` expects these model groups:

- `hero`
  - title, summary, value bullets, media, disclosure, primary/secondary actions
- `atAGlanceSection`
  - labels for audience, state, delivery, and trust framing
- `atAGlance`
  - audience summary, audience highlights, delivery summary, trust notes, derived state
- `contentSection`
  - section heading for the narrative/programme body
- `sections`
  - ordered narrative blocks from the programme record
- `relatedSessionsSection`
  - heading contract for any linked live routes
- `relatedSessions`
  - session cards already normalized through the canonical session runtime
- `trustSection`
  - trust-signal cards plus local trust notes
- `ctaBand`
  - final decision surface back into live support or contact
- `notice`
  - launch-safe editorial note for intentionally minimal detail

## Reuse Rules

Future programme detail prompts should:

- extend content in the canonical programme JSON first
- only add new template slots when the need is reusable across the family
- keep session logistics in the session layer
- treat `notice` as an honesty surface, not filler copy
- keep the at-a-glance state block aligned with the derived programme state model

## Overview Card Contract

`ProgrammePillarCard` is the overview counterpart to the detail template.
It already supports:

- hero illustration and disclosure
- icon + title identity
- audience summary and highlights
- delivery summary
- gains list
- derived programme state
- linked live route callout when present
- trust cues
- primary and secondary actions

Prompt 20 can now refine the first detail page without rebuilding this contract from scratch.
