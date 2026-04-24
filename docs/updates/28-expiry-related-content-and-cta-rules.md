# Prompt 28 - Expiry, Related Content, and CTA Rules

Prompt 28 formalizes how editorial detail pages stay accessible without appearing more current than they really are.

## Lifecycle rules

- Draft items are not detail-visible.
- Archived items may keep a detail route for context but drop out of the live index.
- Closed opportunities may keep a detail route when the content should remain readable as a record.
- Past events can stay accessible without remaining featured or current.
- Cancelled and postponed events use explicit lifecycle notices instead of silently behaving like upcoming events.

## Index versus detail visibility

`detailVisible` and `indexVisible` are now separate states.

That means:

- `/events-updates/` can stay current and calm
- older or superseded items can remain linkable when needed
- the homepage does not accidentally surface stale editorial items

## Related-content rules

Related content is now driven by canonical `relatedItemIds` in the editorial collection.

The runtime only includes related items when they are:

- not the current item
- still detail-visible

If nothing suitable remains, the related section disappears cleanly instead of rendering a dead panel.

## CTA rules

Every editorial detail page now has three distinct CTA layers:

- hero actions for the immediate practical route
- optional in-section action references where narrative context benefits from a nearby handoff
- a closing `ctaBand` for the final next-step decision

The family keeps those layers truthful by routing into existing production destinations only:

- `Sessions`
- `Get Involved`
- `Contact`

No detail page invents booking, registration, event-host, or volunteer-role specifics that the source material does not support.

## Prompt 29 implication

Prompt 29 can now consume opportunity-shaped editorial signals from the canonical feed without rebuilding lifecycle logic, related-item filtering, or practical handoff rules.
