# Prompt 52 - Link, Reference, Slug, and Sanitization Governance

## Outcome

Prompt 52 extends CMS governance from field boundaries into publication safety.

The practical control points are:

- `site/src/content/cmsScope/default.json`
- `site/src/content/cmsWorkflow/default.json`
- `site/src/lib/cms/content-model.js`
- `site/scripts/validate-cms-scope.mjs`
- existing structural validators such as `validate-structured-content.mjs` and `validate-seo-metadata.mjs`

## Link Governance

Prompt 51 already established link policies:

- `none`
- `internal-route-only`
- `external-allowlist`
- `operator-managed`

Prompt 52 keeps those policies inside the generated surface catalog so the future admin UI can render the correct control:

- plain text
- route picker
- operator-only external destination
- locked field

No editable surface gains free-form public URL entry by default.

## Slug Governance

Durable identifiers in the write model are now based on:

- page ids
- slugs
- group ids
- surface ids
- collection item ids

Document ids are generated as:

- `{documentTypeId}:{recordKey}`

Revision ids are generated as:

- `{documentId}@v{version}`

This means:

- slugs remain stable identifiers
- write-side revisions do not invent new URL rules
- the public site keeps canonical route ownership

## Reference Integrity

Prompt 52 does not replace the earlier structural validators. It layers the CMS contract over them.

That means publication still depends on the existing checks for:

- valid route/page references
- FAQ group existence
- media existence
- SEO page directive coverage
- canonical page inventory alignment

The CMS write model does not get to bypass those controls.

## Sanitization Rule

The system still refuses to become an arbitrary rich-text or embed surface.

The allowed editorial formats remain constrained by mutation primitives:

- short plain text
- long plain text
- constrained rich text
- repeatable fixed-template lists
- SEO snippets
- alt text

Forbidden by contract:

- raw HTML
- arbitrary CSS
- arbitrary JavaScript
- iframes
- embed code
- layout control
- component reordering

## Publication Safety Rule

Malformed or incomplete content must not publish silently.

The repo now enforces that via:

- content schema validation
- CMS surface validation
- lifecycle validation
- generated read-model validation
- migration diff verification

If the generated published snapshot diverges from the seeded source baseline unexpectedly, the CMS validator fails.
