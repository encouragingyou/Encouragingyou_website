# Prompt 15 - Voice And Tone Operating System

Prompt 15 turns editorial stance into a structured runtime asset instead of leaving it as scattered good intentions across route copy.

## Canonical source

The operational editorial source now lives in `site/src/content/editorialSystem/default.json`.

It defines:

- `voicePrinciples`
- `audienceModes`
- `contentPatterns`
- `microcopyPatterns`
- `placeholderPolicies`
- `templateContracts`
- `futurePromptChecklist`
- `bannedPublicPhrases`

`site/src/lib/content/editorial-guidance.ts` is the runtime adapter for that content.

## House voice

The site voice is now governed by five working principles:

1. Practical first
2. Warm with boundaries
3. Dignity, not pity
4. Calm trust
5. No project jargon

Those principles were chosen to keep the public site aligned with the blueprint language: warm, credible, youth-led, practical, and community-rooted without sounding sentimental or institutional.

## Audience handling

Prompt 15 also formalizes tone by audience rather than assuming one blanket voice fits every route.

- young people: direct, low-pressure, never childish
- parents/carers and referrers: calm, specific, credibility-forward
- community members and older people: grounded and welcoming
- volunteers, partners, and funders: transparent, credible, non-corporate

The audience modes are validated against the actual audiences used in page definitions, contact reasons, and involvement routes.

## Runtime use

The operating system is already live in two shared surfaces:

- support-form microcopy now comes from `editorialSystem.microcopyPatterns.supportForm`
- placeholder governance now comes from `editorialSystem.placeholderPolicies`

That means prompt 15 affects public output, not just documentation.
