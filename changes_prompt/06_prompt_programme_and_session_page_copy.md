# Prompt 06 - Strengthen Programme And Session Page Copy

You are implementing prompt 06 in `/Users/test/Code/new_website`. Read `changes_prompt/00_verified_materials.md` first and re-check any route you link to.

## Goal

Make the destination pages fulfil the promise of the new click-through homepage. When users click a button, the page they land on should contain the depth that was removed from the homepage.

## Files To Inspect First

- `site/src/content/programmes/community-friendship.json`
- `site/src/content/programmes/personal-growth-life-skills.json`
- `site/src/content/programmes/career-support-cv-help.json`
- `site/src/content/programmes/community-support-intergenerational-connection.json`
- `site/src/content/sessions/youth-club.json`
- `site/src/content/sessions/cv-support.json`
- `site/src/content/programmePageContent/default.json`
- `site/src/content/sessionPageContent/default.json`
- `site/src/pages/programmes/index.astro`
- `site/src/pages/programmes/[slug].astro`
- `site/src/pages/sessions/index.astro`
- `site/src/pages/sessions/[slug].astro`
- Relevant tests under `site/tests/*programme*.test.mjs`, `site/tests/*session*.test.mjs`, and `site/tests/e2e/contracts/*route.spec.mjs`

## Implementation Requirements

1. Make programme labels more concrete where supporting copy appears:
   - Community & Friendship: focus on speaking to people, joining in at your pace, games/conversation, and feeling comfortable coming back.
   - Personal Growth & Life Skills: focus on real-life confidence, motivation, everyday skills, and next steps.
   - Career Support & CV Help: focus on CVs, applications, interviews, work/college next steps, and bringing unfinished drafts/questions.
2. Keep the Sessions pages practical:
   - what happens
   - when it happens
   - what to expect
   - how to ask before attending
3. Keep exact verified facts:
   - CV support every Saturday at 16:45 for 120 minutes.
   - Youth club every Saturday at 18:45 for 120 minutes.
   - Location locality is Rochdale.
   - Exact venue shared on enquiry.
4. Do not invent:
   - price
   - referral requirement
   - public venue
   - phone number
   - staff names
   - outcomes backed by statistics
5. Update tests when content contracts change.

## Acceptance Checks

- Clicking homepage route cards lands on pages with enough useful content that the homepage no longer needs to carry the full detail.
- Programme pages use specific outcome-led summaries.
- Session pages retain verified schedule facts.
- Unit tests for programme and session content pass.
- No unverified age range, price, phone, venue, testimonial, or impact stat appears.

