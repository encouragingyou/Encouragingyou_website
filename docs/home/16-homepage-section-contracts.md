# Homepage Section Contracts

Canonical section definitions live in `site/src/content/homePage/default.json`.

## Hero

- Purpose: explain the offer in one pass and expose the primary and secondary actions immediately.
- Required inputs: headline, summary, badges, primary action, secondary action, hero media.
- Optional inputs: none at launch.
- Fallback: fail build if the hero action pair or media goes missing.
- Pattern: `HomeHero`.

## Quick actions

- Purpose: front-load the most common tasks without making every CTA equally important.
- Required inputs: four action references with icon and summary.
- Optional inputs: additional support routes later, if they do not dilute the main stack.
- Fallback: fail build if any action reference is unknown.
- Pattern: section heading plus `ActionCard` grid.

## Trust strip

- Purpose: answer the first trust questions close to the main actions.
- Required inputs: trust-signal references plus distinct action routes for each signal.
- Optional inputs: short summary text.
- Fallback: fail build if the strip loses all trust items.
- Pattern: tinted section plus linked trust cards.

## Live sessions

- Purpose: show the current Saturday rhythm for visitors who are ready to act.
- Required inputs: canonical session data from the temporal engine and a support fallback action.
- Optional inputs: primary and secondary actions.
- Fallback:
  - `available`: show session cards.
  - `paused`: keep cards if present, but surface paused-state guidance.
  - `unavailable`: do not invent dates; show the support route instead.
- Pattern: section heading plus `SessionSummaryCard` grid.

## Programme teasers

- Purpose: broaden understanding beyond the Saturday story.
- Required inputs: explicit programme slug list and a route to the full programmes index.
- Optional inputs: section summary.
- Fallback: if a listed programme disappears, fail build rather than silently dropping a support pillar.
- Pattern: section heading plus `ProgrammeCard` grid.

## About teaser

- Purpose: explain why the organisation exists without turning the homepage into the full about page.
- Required inputs: source page reference and a single action into `/about/`.
- Optional inputs: badges from the about intro.
- Fallback: if the about page intro changes, the teaser should still render from the homepage copy and route reference.
- Pattern: compact teaser band or split panel in Prompt 17.

## Wider community support feature

- Purpose: make it obvious that the welcome extends beyond youth club attendance alone.
- Required inputs: summary, bullet list, illustration, and route into the community-support programme detail.
- Optional inputs: none at launch.
- Fallback: keep the feature live even if later programme depth is sparse, but never route it back to sessions.
- Pattern: `FeatureSplit`.

## Updates surface

- Purpose: reserve a truthful homepage slot for future dates and news without inventing a feed.
- Required inputs: updates collection reference, primary action, empty-state copy.
- Optional inputs: up to two live items when the feed is populated.
- Fallback:
  - `present`: show update cards.
  - `absent`: render the teaser/empty state, not fake activity.
- Pattern: teaser band in Prompt 17.

## Involvement CTA

- Purpose: support volunteers, partners, and referrers without competing with the primary support journey.
- Required inputs: involvement action, email fallback, badges, illustration.
- Optional inputs: additional partner-specific proof later.
- Fallback: keep the hub route and direct email visible even if deeper volunteer/partner pages stay light.
- Pattern: `FeatureSplit`.

## FAQ cluster

- Purpose: lower anxiety before contact.
- Required inputs: FAQ group and support action.
- Optional inputs: short summary.
- Fallback: fail build if the FAQ group reference breaks.
- Pattern: section heading plus `FaqGroup`.

## Contact panel

- Purpose: give a low-friction support route at the bottom of the homepage without burying it.
- Required inputs: form surface, privacy microcopy, urgent guidance, support reasons.
- Optional inputs: secondary safeguarding link.
- Fallback: if richer contact data stays pending, the email-backed support form remains the launch-safe route.
- Pattern: support/contact teaser now, richer modular panel in Prompt 17.
