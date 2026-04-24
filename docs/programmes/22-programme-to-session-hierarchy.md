# Prompt 22 - Programme To Session Hierarchy

## Canonical Relationship Model

Prompt 22 did not need a new relationship primitive.
The existing canonical link model was already the right foundation:

- `site/src/content/programmes/career-support-cv-help.json#relatedSessionIds`
- `site/src/content/sessions/cv-support.json#programmeIds`
- `site/src/lib/content/site-content.ts#getProgrammeLinkedSessions`

Career Support now proves that the model can carry a real live-linked route without turning the programme page into a session clone.

## Programme Page Responsibilities

The Career Support programme page now owns:

- who the route is for
- what sort of support belongs here
- what someone may gain
- how the support should feel
- why the live session is relevant
- what to do if someone is unsure whether the live route fits

## Session Page Responsibilities

The linked CV Support session route continues to own:

- exact Saturday recurrence
- next-occurrence derivation
- add-to-calendar file
- live time window
- what to bring
- most attendance-specific first-visit detail

This separation matters because the programme should remain useful even if more than one employability-format route exists later.

## State Rules

Career Support remains `active-session-linked`, so the route uses the live-linked branch of the programme state helper.

That means:

- `live-session` when CV support has a current scheduled occurrence
- `session-limited` if the linked session exists but the next occurrence is temporarily unavailable

The page-level notices now explain that shift without changing the canonical relationship itself.

## Structured Relationship Hints

Programme detail structured data now carries two linked-session signals when a primary live route exists:

- `relatedLink`
- `hasPart`

This keeps the live session relationship visible in metadata as well as in the route UI.
