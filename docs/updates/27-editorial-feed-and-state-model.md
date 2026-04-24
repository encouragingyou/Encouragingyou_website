# Prompt 27 - Editorial Feed And State Model

Prompt 27 replaces the empty launch feed with a structured editorial model that can stay honest at low volume.

## Canonical source

`site/src/content/updatesFeed/default.json` now defines:

- `index` copy for filter labels, featured/feed headings, archive notice, and empty states
- `categories` for the public filter taxonomy
- `items` for the actual published editorial entries

Each item can now express:

- `updateType`: `event`, `update`, or `opportunity`
- featured priority
- home visibility
- archive behavior
- date, time, location, and status labels
- route/action mapping
- optional media attachment

## Derived model

`site/src/lib/domain/editorial-feed.js` turns the raw content into four public-facing slices:

- `featuredItem`
- `feedItems`
- `publicItems`
- `homeItems`

It also derives category counts and item-level state, including whether a dated event should remain featured, stay in the feed, or step down.

## Truth boundary

The seeded launch feed proves the system without inventing a fake newsroom:

- one featured event-style notice with dates still to be confirmed
- one practical route update pointing to Sessions
- one opportunity item pointing to Get Involved

This keeps the editorial layer useful while staying inside the verified public evidence.
