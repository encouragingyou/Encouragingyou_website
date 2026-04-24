# Cutover Checklist

Date: 2026-04-23

## Route checkpoints

- [x] `site/` is the primary app runtime for local dev, build, and browser QA.
- [x] Legacy prototype pages can be served through the Astro runtime without changing URLs.
- [x] Public prototype assets can be synced into `site/public/` with one repeatable command.
- [x] The new Astro homepage remains live at `/`.
- [x] The new Astro 404 route remains live at `/404/`.
- [x] The new runtime now owns `/programmes/`.
- [x] The new runtime now owns `/programmes/[slug]/`.
- [x] The new runtime now owns `/events-updates/`.
- [x] The new runtime now owns `/contact/`.
- [x] The new runtime now owns `/volunteer/`.
- [x] The new runtime now owns `/partner/`.
- [x] The new runtime now owns `/cookies/`.
- [x] The new runtime now owns `/accessibility/`.
- [x] The new runtime now owns `/terms/`.
- [x] Replace `/about/` with Astro implementation and remove it from the legacy bridge manifest.
- [x] Replace `/sessions/` with Astro implementation and remove it from the legacy bridge manifest.
- [x] Replace `/sessions/cv-support/` with Astro implementation and remove it from the legacy bridge manifest.
- [x] Replace `/sessions/youth-club/` with Astro implementation and remove it from the legacy bridge manifest.
- [x] Replace `/get-involved/` with Astro implementation and remove it from the legacy bridge manifest.
- [x] Replace `/safeguarding/` with Astro implementation and remove it from the legacy bridge manifest.
- [x] Replace `/privacy/` with Astro implementation and remove it from the legacy bridge manifest.

## Asset checkpoints

- [x] Sync prototype public assets into `site/public/`.
- [x] Keep copied assets classified in the route parity matrix.
- [ ] Replace prototype CSS for legacy routes after all bridged HTML routes are retired.
- [ ] Replace prototype JS for legacy routes after all bridged HTML routes are retired.
- [ ] Replace copied calendar files with generated outputs from canonical session data.
- [ ] Replace copied sitemap output with generated sitemap output from the new runtime.
- [x] Replace copied image outputs once the production asset pipeline is in place.

## Quality-gate checkpoints

- [x] Unit tests still pass after stack realization.
- [x] Playwright runs against the Astro runtime entry point rather than the prototype static preview.
- [x] Route parity data is machine-readable.
- [ ] Add additional browser checks as new Astro-owned routes become user-critical.

## Rules before deleting any legacy item

- [ ] Astro replacement exists.
- [ ] Playwright coverage exists for the user-visible behavior.
- [ ] Route parity matrix has been regenerated.
- [ ] Handoff note documents the retirement.
