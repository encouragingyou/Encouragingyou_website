# Prompt 26 - Youth Club Route Architecture

Prompt 26 upgrades `/sessions/youth-club/` into the belonging-led counterpart to the task-oriented CV Support route.

## Architecture decision

- Keep the shared session-detail family from Prompt 25 intact.
- Do not create a Youth Club-only template or route-local rendering branch.
- Express the difference through canonical session data, page-specific session content, and a dedicated FAQ group.

## Route composition

The production route is still assembled by `getSessionDetailModel()` and rendered by `SessionDetailTemplate.astro`, but the Youth Club content contract now emphasizes:

- first-visit reassurance before procedural detail
- repeated attendance and friendship-building over one-off task completion
- more than one valid participation mode
- parent/carer reassurance as an additive trust surface rather than the dominant narrative
- explicit bridging back to the wider Community & Friendship programme

## Canonical truth boundary

The route now publishes only the facts that the repo evidence supports consistently:

- Saturday recurring session rhythm
- Rochdale as the public location anchor
- venue detail shared on enquiry
- games, activities, conversation, and chill time as the public session shape
- low-pressure welcome, friendship, and safe-space intent

The route deliberately does not invent:

- exact age bands
- staffing structures
- booking rules
- precise venue publication
- pastoral or therapeutic promises beyond the verified public brief

## Shared-family outcome

Prompt 25 proved the family could support a practical, task-led session. Prompt 26 proves the same family can also support a belonging-led recurring offer without structural drift. The reusable change is the stronger authored truth layer, not a new component branch.
