# Prompt 01 - Establish The Verified Change Contract

You are implementing client feedback in `/Users/test/Code/new_website`. Start by reading `changes_prompt/00_verified_materials.md` and cross-check every link or route you use before acting. Do not assume missing facts.

## Goal

Create a concise implementation contract for the website change so the later prompts can update the site without drifting from verified facts.

## Required Work

1. Run `git status --short` from `/Users/test/Code/new_website` and note any existing dirty files. Do not revert user or generated changes.
2. Re-open and read these files:
   - `site/src/pages/index.astro`
   - `site/src/content/homePage/default.json`
   - `site/src/content/navigation/default.json`
   - `site/src/content/pageDefinitions/launch.json`
   - `source/encouragingyou-site-look-and-feel.md`
   - `changes_prompt/00_verified_materials.md`
3. Create or update a tracked implementation note, preferably `docs/client-feedback/landing-page-routing-contract.md`.
4. The note must define the new contract:
   - Homepage becomes a compact landing and route hub, not a stacked version of the full site.
   - Primary route buttons must navigate to real routes, not page anchors.
   - Existing subpages remain the place for depth: About, Programmes, Sessions, Events & Updates, Get Involved, Safeguarding, Contact.
   - The exact numeric youth age range is not verified. Use `young people in Rochdale` unless an approved source is found.
   - Do not invent public phone, venue/address, pricing, referral rules, testimonials, impact stats, partner logos, or new external links.
5. Include a verified route table in the note. Re-run a local route check against all routes in `site/src/content/pageDefinitions/launch.json` or document why it could not run.
6. State that the older long homepage order in `source/encouragingyou-site-look-and-feel.md` is superseded by the client feedback, while the tone/palette guidance remains useful.

## Acceptance Checks

- The new note is based only on verified files and live route checks.
- Every URL in the note has been checked in this implementation turn.
- The note explicitly says the homepage must stop rendering all ten old `home.sections`.
- The note records the `npm run links:validate` adapter mismatch if it still exists.
- No production site code needs to change in this prompt unless needed to keep the note accurate.

