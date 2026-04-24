# Prompt 40 - Technical SEO Validation Workflow

Prompt 40 adds a dedicated discovery-layer workflow on top of the Prompt 39 metadata validation.

## Command surface

- `npm run seo:validate`
  - validates route-level metadata directives, title/description ranges, and editorial indexability intent
- `npm run social:generate`
  - regenerates route-family social preview PNGs and the preview manifest
- `npm run discovery:generate`
  - regenerates `robots.txt` and `sitemap.xml`
- `npm run discovery:validate`
  - validates generated robots/sitemap output against the canonical route inventory and preview coverage
- `npm run test:unit`
  - includes helper coverage in `tests/discovery-layer.test.mjs`
- `npm run test:e2e`
  - includes browser-level checks for discovery delivery, metadata, and schema output
- `npm run ci`
  - runs the full validation and browser pipeline

## What each layer catches

### Metadata validation

Catches:

- missing SEO directives
- duplicate indexable titles
- duplicate indexable canonical routes
- missing editorial directive coverage

### Discovery generation + validation

Catches:

- stale `robots.txt`
- stale `sitemap.xml`
- sitemap inclusion drift
- missing social-preview files
- missing route-family preview coverage

### Unit tests

Catches:

- canonical-only sitemap rules regressing
- robots policy drifting toward overblocking
- preview-manifest family gaps
- schema helper regressions such as nested-context mistakes

### Browser tests

Catches:

- missing or wrong `og:image` values
- missing route JSON-LD on real pages
- sitemap or robots responses drifting from the generated outputs
- schema types disappearing from critical routes

## Expected maintenance pattern

When a new public route family is added:

1. add or update its SEO directive
2. map it to a discovery route family
3. add a matching social-preview family if no existing family is appropriate
4. regenerate preview assets
5. regenerate discovery files
6. run `npm run ci`

## Deliberate current limits

- `lastmod` is omitted until freshness can be proven consistently
- no schema linting library is added yet; correctness is enforced through canonical builders, unit assertions, and route-level browser checks
- route-family preview assets are shared across related pages by design; this keeps the share layer lightweight and maintainable at the current site scale
