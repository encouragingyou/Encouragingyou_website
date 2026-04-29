# Prompt 05 - Rewrite Homepage Copy Into Specific Youth Outcomes

You are implementing prompt 05 in `/Users/test/Code/new_website`. Read `changes_prompt/00_verified_materials.md` first. Do not invent ages, claims, or service details.

## Goal

Replace generic and business-like homepage wording with specific, outcome-driven copy that directly answers the client's notes.

## Files To Inspect First

- `site/src/content/homePage/default.json`
- `site/src/content/siteSettings/default.json`
- `site/src/content/contactInfo/default.json`
- `site/src/content/programmes/community-friendship.json`
- `site/src/content/programmes/personal-growth-life-skills.json`
- `site/src/content/programmes/career-support-cv-help.json`
- `site/src/content/sessions/youth-club.json`
- `site/src/content/sessions/cv-support.json`
- `site/tests/home-page.test.mjs`
- `site/tests/home-page-model.test.mjs`

## Required Copy Direction

Use this line prominently:

`Helping young people in Rochdale build confidence, friendships and future opportunities.`

Add a short intro with this meaning:

- Who it is for: young people in Rochdale. No exact age range unless verified.
- What happens: youth club, CV/application help, confidence-building, friendship, and practical support.
- Why it matters: young people can speak up, make friends, feel more confident in real situations, and get help with next steps.

Replace generic phrases with specific outcomes:

- Instead of only `Build confidence`, use wording like `We help young people speak up, make friends, and feel more confident in real-life situations.`
- Instead of only `Career support`, use wording like `Get real help writing your CV, applying for jobs, and preparing for interviews.`
- Instead of abstract `Personal Growth`, explain confidence, life skills, motivation, and practical next steps.
- Instead of abstract `Community & Friendship`, explain low-pressure friendship, games, conversation, and a place to feel comfortable returning to.

## Implementation Requirements

1. Update homepage copy where it appears in the actual rendered route hub.
2. Keep CTAs short:
   - `Join a session`
   - `Get CV help`
   - `Visit youth club`
   - `Ask a question`
3. Keep copy plain. Avoid jargon like `holistic provision`, `stakeholders`, `capacity building`, or `pathways` unless the page context truly needs it.
4. Do not add testimonials, impact numbers, partner proof, public phone, venue address, pricing, or referral rules.
5. If the content model requires fields that are no longer rendered on the homepage, either keep safe fallback copy or refactor the model cleanly with tests.

## Acceptance Checks

- Homepage H1 or primary headline contains the client-approved promise.
- Intro clearly covers who, what, and why.
- No numeric age appears unless a verified approved source is cited in code or docs.
- The rendered homepage has no vague route-card copy like only `Build confidence` without a concrete outcome.
- Tests assert the new copy contract without hardcoding brittle full paragraphs unless necessary.

