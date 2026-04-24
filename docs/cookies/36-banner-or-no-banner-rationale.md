# Prompt 36 - Banner or No-Banner Rationale

> Updated by Prompt 43: the site still does not use a banner at launch, but the reason is now the narrow first-party statistical-measurement model plus an objection control on `/cookies/`, not pure analytics absence.

## Decision

Launch with no cookie banner.

## Why

The audited build does not activate non-essential storage/access technologies. There is nothing non-essential for a visitor to accept or reject today.

Adding a banner anyway would be misleading because it would:

- imply that optional tracking or profiling is live when it is not;
- introduce consent ceremony without a real underlying choice; and
- force the site to create a consent-state surface that the current build does not need.

## What stays visible instead

- `/cookies/` is now a real production route with the audited launch position
- the footer legal navigation keeps that route permanently available
- the Privacy Notice now cross-refers to the Cookie Notice and the launch no-banner state

## Trigger for revisiting this decision

The no-banner decision must be replaced by a real consent experience if a future change adds:

- analytics or measurement scripts that fall outside a valid exemption;
- advertising, remarketing, or campaign tags;
- third-party embeds that store or access information on the device before or beyond the requested interaction;
- consent preference storage; or
- client-side storage used for personalization, cross-visit state, or identification.

## Future consent UX standard

If the site ever moves to `banner`, the implementation must ship with:

- equal accept and reject emphasis;
- a clear customize path;
- durable withdrawal and revisit controls; and
- real script/storage gating rather than decorative copy.
