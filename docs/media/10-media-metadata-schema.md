# Prompt 10 Media Metadata Schema

The media manifest lives at `site/src/content/mediaLibrary/default.json`.

Each asset record now describes both editorial meaning and delivery behavior.

## Top-level fields

| Field                  | Purpose                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `id`                   | stable reference used by structured content                                         |
| `kind`                 | `illustration` or `icon`                                                            |
| `family`               | human-readable family/stem for grouped variants                                     |
| `label`                | inventory label for docs and internal review                                        |
| `canonicalSourcePath`  | authoritative master in `source/media_attachment/`                                  |
| `masterAssetPath`      | generated local production copy under `site/src/assets/media/`                      |
| `provenance`           | source type, currently supplied AI illustration or AI icon master                   |
| `masterDimensions`     | canonical master width and height                                                   |
| `focalIntent`          | crop/placement guidance for future page work                                        |
| `altStrategy`          | `descriptive` or `decorative`                                                       |
| `alt`                  | actual alt copy; empty for decorative assets                                        |
| `caption`              | optional caption slot, currently unused                                             |
| `aiGenerated`          | explicit provenance flag                                                            |
| `requiresDisclosure`   | whether a disclosure notice should accompany usage                                  |
| `noticeId`             | notice record to use when disclosure is required                                    |
| `replacementPriority`  | launch-to-future migration intent                                                   |
| `replacementNotes`     | future replacement guidance, especially for trust-critical photography              |
| `preferredContexts`    | known route/component contexts where the asset is intended to be reused             |
| `astroDelivery`        | production delivery settings for Astro routes                                       |
| `compatibilityRenders` | generated stable public files for compatibility consumers that still expect `/images/**` or `/icons/**` paths |

## Astro delivery contract

`astroDelivery` is deliberately split by media type.

### Illustrations

- `formats`
  Currently `avif` and `webp`
- `responsiveWidths`
  Widths passed to Astro `Picture`
- `defaultWidth`
  The default editorial width band for planning and compatibility
- `fixedWidth` / `fixedHeight`
  `null` for illustrations

### Icons

- `formats`
  Currently `webp`
- `responsiveWidths`
  `null`
- `fixedWidth` / `fixedHeight`
  Fixed launch size used by the shared icon abstraction

## Runtime shape

`site/src/lib/media/catalog.ts` merges the JSON manifest with Astro-imported image metadata and returns a richer runtime asset object used by the app:

- `source`
  Local Astro image metadata
- `aspectRatio`
  Calculated from the imported local master copy

This means route code consumes media by ID and gets both editorial metadata and real intrinsic sizing from one place.

## Accessibility rules encoded by the schema

- informative assets must have non-empty alt text
- decorative assets must keep empty alt text
- disclosure-required assets must point to a real notice
- icons are decorative at launch unless a future prompt introduces a functional/icon-label use case

## Trust and replacement rules

Prompt 10 does not pretend the launch art is final photography.

The schema carries:

- explicit `aiGenerated` flags
- notice linkage for disclosure
- replacement priority
- replacement notes for consented real-photography handoff

That keeps the launch state honest and gives prompt 38 and later content prompts a concrete migration path instead of a vague note in prose.
