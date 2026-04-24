# Prompt 22 - Career Support State And CTA Model

## Current State Choice

Career Support & CV Help currently resolves to `live-session`.

That state is justified because:

- the programme record is `active-session-linked`
- `cv-support` is linked canonically
- the linked session currently has a scheduled Saturday occurrence

Primary state ownership:

- `site/src/lib/domain/programme-route-state.js`
- `site/src/lib/content/site-content.ts#buildProgrammeStateModel`

## CTA Hierarchy

Prompt 22 needed a stronger CTA hierarchy than the previous generic family defaults.

The route now uses:

1. hero
   - `See CV support`
   - `Contact the team`
2. live-route section notice
   - session-first handoff when the live route is active
   - contact fallback if the live route becomes limited
3. closing CTA band
   - `See CV support`
   - `Contact the team`
   - `See all sessions`

This covers three distinct user intents:

- direct practical help now
- broader guidance first
- live-session browsing across the wider site

## Truth-Sensitive Routing Rules

The route now follows these handoff rules:

- use the programme page to understand the practical-support offer
- use the session page for the exact live Saturday route
- use contact when someone is unsure whether the live route fits or wants to ask first
- keep safeguarding and privacy visible because support questions can be personal

## Reusable Override Contract

`programmePageContent.pages[]` can now optionally define:

- `hero.primaryAction`
- `hero.secondaryAction`
- `ctaBand`

If absent, the shared family defaults still apply.
That means later programme routes can stay simple, while routes with stronger conversion needs can sharpen the CTA hierarchy without changing the template.
