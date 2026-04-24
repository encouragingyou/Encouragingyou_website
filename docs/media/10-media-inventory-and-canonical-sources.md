# Prompt 10 Media Inventory And Canonical Sources

Prompt 10 replaces the prototype-era media chain with a canonical-source system that distinguishes between source masters, production imports, and compatibility outputs.

## Canonical source map

| Media family                          | Canonical master                                                                  | Production master copy                                                        | Compatibility outputs                       | Notes                                          |
| ------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| `hero-home`                           | `source/media_attachment/1) Homepage hero illustration.png`                       | `site/src/assets/media/illustrations/hero-home.png`                           | `site/public/images/hero-*`                 | wide homepage hero art                         |
| `about-leadership`                    | `source/media_attachment/2) About page : youth-led leadership illustration.png`   | `site/src/assets/media/illustrations/about-leadership.png`                    | `site/public/images/about-*`                | now used by the Astro-owned About page plus compatibility outputs |
| `programme-community-friendship`      | `source/media_attachment/3) Programme card series Community  Friendship.png`      | `site/src/assets/media/illustrations/programme-community-friendship.png`      | `site/public/images/community-friendship-*` | also backs legacy imported session references  |
| `programme-personal-growth`           | `source/media_attachment/4) Programme card series Personal Growth.png`            | `site/src/assets/media/illustrations/programme-personal-growth.png`           | `site/public/images/personal-growth-*`      | square card art                                |
| `programme-career-support`            | `source/media_attachment/5) Programme card series Career Support.png`             | `site/src/assets/media/illustrations/programme-career-support.png`            | `site/public/images/career-support-*`       | also backs legacy imported session references  |
| `community-support-intergenerational` | `source/media_attachment/6) Intergenerational community support illustration.png` | `site/src/assets/media/illustrations/community-support-intergenerational.png` | `site/public/images/intergenerational-*`    | wide editorial art                             |
| `volunteer-partner-cta`               | `source/media_attachment/7) Volunteer : partner call-to-action illustration.png`  | `site/src/assets/media/illustrations/volunteer-partner-cta.png`               | `site/public/images/volunteer-partner-*`    | wide CTA art                                   |
| icon families                         | `source/media_attachment/8) Custom icon set for UX and wayfinding/*.png`          | `site/src/assets/media/icon-masters/*.png`                                    | `site/public/icons/*.webp`                  | launch uses raster icon masters                |

## What is authoritative now

1. `source/media_attachment/` is the archive of supplied masters and remains untouched.
2. `site/src/content/mediaLibrary/default.json` is the canonical metadata manifest.
3. `site/src/assets/media/**` is the local production-copy layer that Astro imports.
4. `site/src/lib/media/catalog.ts` is the runtime bridge from manifest IDs to local Astro-importable assets.
5. `site/public/images/**` and `site/public/icons/**` are generated compatibility outputs, not hand-edited assets and not copied from `source/blurpint`.

## What is no longer authoritative

- `source/blurpint/images/**`
- `source/blurpint/icons/**`
- `source/blurpint/scripts/build-images.sh`

Those remain useful only as historical reference for the previous prototype export pattern. They are no longer the build input for the production app.

## Compatibility rules

Prompt 10 keeps stable public `/images/**` and `/icons/**` paths available by regenerating them from the canonical masters instead of copying prototype derivatives forward. That preserves compatibility while removing the old dependency on `source/blurpint/images` and `source/blurpint/icons`.

## Generated artifacts

- `site/src/data/generated/media-build-report.json`
  Records which canonical masters were copied and which compatibility files were generated.
- `site/src/data/generated/imported-blurpint-sessions.json`
  Now keeps the old prototype image URL as `legacyImage` but also records `imageMediaId` so later session/event work can resolve media through the prompt 10 system.
