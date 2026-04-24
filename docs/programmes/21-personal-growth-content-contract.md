# Prompt 21 - Personal Growth Content Contract

## Source Layers

The Personal Growth route now uses three explicit content layers:

- programme JSON
  - enduring promise, audience framing, trust notes, delivery mode, and body narrative
- programme page content
  - hero language, experience framing, delivery empty state, notices, panels, FAQ binding, and proof boundary
- FAQ JSON
  - first-question answers that stay reusable and evidence-safe

Primary files:

- `site/src/content/programmes/personal-growth-life-skills.json`
- `site/src/content/programmePageContent/default.json`
- `site/src/content/faqs/default.json`

## Publishable Facts

Prompt 21 treats these as safe to publish now:

- confidence-building and life-skills support are part of the offer
- mentoring, motivation, and practical guidance belong in the public framing
- the route is intended for young people who need encouragement, development, or help finding a next step
- the first public action is an enquiry, not a claimed timetable

## Withheld Facts

The route must not publish:

- invented workshop dates or recurrence
- unsupported age-range promises
- named mentors or staffing availability
- photographic proof or outcome claims that have not been approved
- one-to-one or workshop formats stated as always available when the source material does not confirm that

## Route-Specific Content Responsibilities

`programmePageContent.pages[programme-personal-growth-life-skills]` now owns:

- hero headline and supporting note
- experience-section cards
- `relatedSessionsSection.overviewNotice`
- `relatedSessionsSection.emptyState`
- delivery-side explanatory panels
- FAQ group binding
- evidence notice

That split keeps the underlying programme record clean while still letting the public page feel intentional and warm.

## Fallback Rule

When future delivery detail becomes concrete, the route should change by editing canonical content first:

- update `existingDeliveryMode`
- add linked session ids if a live route becomes real
- replace overview-only notice or empty-state copy through `programmePageContent`

The template should not need another structural rewrite for that shift.
