# Encouraging You Launch Site

Static-first launch site for EncouragingYou, built around the supplied illustration set.

This site now lives under `/blurpint`. The original source artwork remains one level up in `/media_attachment`.

## Run locally

1. `npm run build:images`
2. `npm run serve`
3. Open `http://localhost:4173`

## Notes

- The site uses local assets only: no social embeds, no analytics, no JS-only navigation.
- Event structured data on the session detail pages is generated in the browser so the next Saturday occurrence stays current.
- Responsive image outputs are generated into `/images` and `/icons` from the source PNGs in `../media_attachment`.
