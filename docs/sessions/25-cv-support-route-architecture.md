# Prompt 25 - CV Support Route Architecture

## Route Purpose

`/sessions/cv-support/` is now the operational detail route for the live CV Support offer.

It is intentionally not:

- a duplicate of the wider Career Support & CV Help programme page
- a thin hero-plus-cards placeholder
- a booking flow that invents confirmed venue or staffing detail

Its job is to let someone understand the live Saturday offer quickly, decide whether it fits, and move into the right next step without anxiety.

Primary implementation:

- `site/src/pages/sessions/[slug].astro`
- `site/src/components/sections/SessionDetailTemplate.astro`
- `site/src/lib/content/site-content.ts#getSessionDetailModel`
- `site/src/content/sessionPageContent/default.json`

## Composition Order

The rebuilt session-detail family now renders in this order:

1. feature-led hero
   - route-specific H1, summary, actions, badges, and AI-art disclosure
   - supporting note keeps the low-pressure ask-first behavior visible
2. schedule notice
   - only appears when recurrence state or calendar state needs explicit explanation
3. at-a-glance band
   - timing, location handling, audience fit, and what-to-bring guidance
4. expectation section
   - authored cards explain how the session works
   - canonical session bullets remain visible as the shared checklist surface
5. reassurance and support section
   - authored cards explain privacy, venue handling, and support behavior
   - canonical trust notes remain visible as the shared reassurance checklist
6. FAQ plus sidebar rail
   - session FAQ stays in the main reading flow
   - urgent help, wider programme bridge, and contact fallback stay visible in the rail
7. closing CTA band
   - keeps support, wider programme context, and safeguarding visible after the main content

## Shared Family Upgrade

Prompt 25 does not solve CV Support with route-only markup.

Reusable session-family ownership now looks like this:

- `SessionDetailTemplate.astro`: shared session-detail composition
- `sessionPageContent/default.json`: canonical authored session-detail copy contract
- `getSessionDetailModel`: shared assembly layer that merges content, session truth, and route actions

That gives Prompt 26 a real reuse path for Youth Club rather than another bespoke page build.
