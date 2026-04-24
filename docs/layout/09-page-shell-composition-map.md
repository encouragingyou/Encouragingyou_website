# Prompt 09 Page Shell Composition Map

This map shows which shell patterns each representative route now uses, where the content comes from, and what prompt 10 and later prompts should reuse instead of rebuilding.

| Route | Primary content model | Shell composition | Key primitives |
| --- | --- | --- | --- |
| `/` | `getHomePageModel()` | hero plus stacked section bands | `HomeHero`, `PageSection`, `layout-grid--cards`, `layout-grid--summary`, support two-column layout |
| `/programmes/` | `getProgrammesIndexModel()` | intro, comparison panels, programme pillars, live-session bridge, CTA close | `PageSection`, `PageIntro`, `ProgrammePillarCard`, `SessionSummaryCard`, `CtaBand` |
| `/programmes/[slug]/` | `getProgrammeDetailModel()` | shared programme-family hero, at-a-glance, narrative, live-route bridge, trust, CTA | `ProgrammeDetailTemplate`, `FeatureSplit`, `CardPanel`, `SessionSummaryCard`, `CtaBand` |
| `/contact/` | `getContactPageModel()` | intro shell plus sidebar form layout | `PageSection`, `PageIntro`, `layout-grid--sidebar` |
| `/sessions/` | `getSessionsIndexModel()` | intro shell, schedule strip, guidance cards, FAQ rail | `PageIntro`, `PageSection`, `layout-grid--summary`, `layout-grid--sidebar` |
| `/sessions/[slug]/` | `getSessionDetailModel()` | media intro shell, detail panels, FAQ plus related rail | `PageIntro`, `DisclosureNote`, `layout-grid--cards`, `layout-grid--sidebar` |
| `/get-involved/` | `getGetInvolvedPageModel()` | media intro shell, route-card band, process plus form rail | `PageIntro`, `PageSection`, `layout-grid--cards-wide`, `layout-grid--sidebar` |
| `/safeguarding/` | `getSafeguardingPageModel()` | intro shell, split escalation panels, secondary guidance rail | `PageIntro`, `layout-grid--cards`, `layout-grid--sidebar` |

## Shared intro-shell pattern

`PageIntro` is now the standard solution for:

- breadcrumb placement
- one clear heading
- summary copy
- badge clusters
- intro actions
- optional media and disclosure pairing
- small supporting meta copy under the main action block

Routes that need a hero-sized intro should still start from `PageIntro` unless they truly need the dedicated homepage hero treatment.

## Shared section-shell pattern

`PageSection` now owns:

- vertical spacing through `section`
- optional tone changes through `section--band` and `section--tint`
- shell width selection through default, wide, and narrow modes

New routes should prefer multiple small `PageSection` blocks over one oversized custom wrapper.

## Legacy and production ownership

Prompt 11 later extended this route set by migrating `/about/` and `/privacy/` into Astro as well.

The responsive-foundation primitives from prompt 09 still remain the basis for those later shell migrations.
