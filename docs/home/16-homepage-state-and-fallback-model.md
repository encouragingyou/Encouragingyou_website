# Homepage State And Fallback Model

Homepage state now has an explicit source of truth in `site/src/content/homePage/default.json`, `site/src/content/updatesFeed/default.json`, and `site/src/lib/content/site-content.ts`.

## Live sessions

Source:
- session collections plus the Prompt 14 temporal engine

States:
- `available`: at least one session is live and publicly renderable
- `paused`: session records exist, but all current states are paused, cancelled, seasonal, or contact-only
- `unavailable`: no session records are available to render

Fallback rules:
- never invent dates
- keep `Get support` available when session certainty is low
- allow paused-state copy to explain uncertainty without hiding the whole route

## Updates surface

Source:
- `site/src/content/updatesFeed/default.json`

States:
- `present`: one or more published update items exist
- `absent`: the feed is empty

Fallback rules:
- empty feed renders a truthful teaser state
- homepage does not simulate activity when no updates are ready
- later prompts can populate the collection without changing homepage structure

## Contact readiness

Source:
- `contactInfo/default.json`
- support-form microcopy from the editorial system

States:
- `verified`: all launch-critical fields are present
- `pending`: at least one tracked non-critical field is still missing

Launch interpretation:
- email, privacy note, and safeguarding route are confirmed enough to keep the contact panel live
- phone and public venue details remain pending and must not be invented

## AI-art disclosure

Source:
- media library notices plus homepage section rules

States:
- `required`: a section uses AI-generated illustration that needs visible disclosure
- `optional`: no launch sections currently use the optional bucket

Launch rule:
- hero, programme teasers, wider-community support, and involvement CTA are disclosure-aware sections

## Shell notices

Source:
- global shell notice placement rules

Current state:
- homepage supports shell notices through the shared shell model even though no dedicated home notice is live yet

## Ownership

State stays in content/runtime layers:

- schedule truth comes from session data
- updates truth comes from the updates collection
- contact readiness comes from structured contact fields
- notice truth comes from shell and notice config

No homepage-only client script is introduced for these states.
