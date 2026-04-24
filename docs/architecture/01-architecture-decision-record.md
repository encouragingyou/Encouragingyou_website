# Architecture Decision Record 01

Status: Accepted
Date: 2026-04-22
Decision owner: Prompt 01 baseline

## Decision

Build the production site as a new Astro application in a separate app root, using:

- static prerendering by default
- typed repo-local content collections as the phase-1 source of truth
- a clear adapter boundary for a future headless CMS
- serverless or server-side form handling for enquiries
- modern CSS with shared design tokens and component-scoped styles
- minimal progressive enhancement only where interaction genuinely needs it

`source/blurpint/` remains in place as a reference prototype and source-asset consumer until migration is complete.

## Context

The current prototype proves visual direction, but it is not a safe long-term foundation because:

- every page duplicates the shell
- all content is hardcoded in HTML
- session data is split across HTML, JS, and ICS files
- forms rely on `mailto:`
- legal and trust pages are not operationally complete
- there is no scalable route, build, testing, or deployment model

The blueprint explicitly recommends a static-first, CMS-driven approach with low JavaScript overhead, strong accessibility, and room for future editorial growth.

## Requirements that drove the decision

The chosen architecture must support:

- content-heavy but not app-heavy pages
- strong accessibility and low-JS defaults
- reusable components and shared layouts
- structured programme, session, event, update, FAQ, legal, and contact content
- future CMS adoption without rewriting page templates
- reliable server-side or serverless forms
- strong performance on mobile
- clear metadata and structured-data generation

## Options considered

### Option A: Continue extending the static HTML prototype in place

Pros:

- lowest short-term change cost
- preserves current output exactly
- no new tooling required

Cons:

- multiplies duplicated markup
- keeps content and route logic fragmented
- makes legal, SEO, and form improvements harder to scale
- provides no editorial model for later prompts

### Option B: Rebuild with Astro plus typed content collections

Pros:

- static-first by design
- component and layout reuse without forcing a client-heavy runtime
- strong fit for content collections and route generation
- easy to keep JavaScript optional and minimal
- clean future path to a headless CMS

Cons:

- requires a new app root and migration effort
- team will need a real build pipeline

### Option C: Rebuild with Next.js App Router in static-first mode

Pros:

- powerful routing and server capability
- good CMS ecosystem fit
- easy future growth into more dynamic features

Cons:

- heavier default abstraction for a mostly content-led site
- easier to accidentally add unnecessary client complexity
- more operational surface area than the current launch needs

### Option D: Rebuild with 11ty and data files

Pros:

- static-first and lightweight
- content and templates can be clean
- low runtime overhead

Cons:

- weaker component ergonomics for the design-system work coming in later prompts
- less aligned with the blueprint's likely future CMS/component workflow
- less comfortable path for progressive enhancement and shared typed content at scale

## Comparative scoring

Scores are 1 to 5, where 5 is best for this project.

| Option | Low-JS performance | Component reuse | Structured content fit | Future CMS fit | Operational simplicity | Total |
| --- | --- | --- | --- | --- | --- | --- |
| Static HTML in place | 5 | 1 | 1 | 1 | 4 | 12 |
| Astro + content collections | 5 | 5 | 5 | 5 | 4 | 24 |
| Next.js static-first | 4 | 4 | 5 | 5 | 2 | 20 |
| 11ty + data files | 5 | 3 | 4 | 3 | 4 | 19 |

Astro is the best match because it keeps the static-first strengths of the current prototype while adding the component, data, and migration ergonomics that the later prompts require.

## Chosen target architecture

### Application root

Reserve a new production app root at:

`site/`

The folder is intentionally separate from `source/blurpint/` so the prototype can remain intact during migration.

### Rendering strategy

- prerender all public content routes by default
- use no client hydration unless a feature materially needs it
- prefer build-time generation for next-session labels, schema, and ICS output rather than client-side injection
- use progressive enhancement for small interactive elements such as accordions or mobile navigation only when native HTML is not enough

### Routing strategy

Use file-based routing in Astro for stable routes and generated routes for content-driven sections:

- `/`
- `/about/`
- `/programmes/`
- `/programmes/[slug]/`
- `/sessions/`
- `/sessions/[slug]/`
- `/events-updates/`
- `/events/[slug]/`
- `/updates/[slug]/`
- `/get-involved/`
- `/volunteer/`
- `/partner/`
- `/contact/`
- `/safeguarding/`
- `/privacy/`
- `/cookies/`
- `/accessibility/`
- `/terms/`
- `/404/`

### Content source strategy

Phase 1 source of truth:

- repo-local structured content files validated with Astro content collections and Zod
- markdown or MDX for long-form editorial content
- JSON or YAML for tightly structured data such as sessions, contact info, and safeguarding data

Planned collections:

- `siteSettings`
- `programmes`
- `sessions`
- `events`
- `updates`
- `faqs`
- `legal`
- `contactInfo`
- `safeguardingInfo`
- `volunteerRoles`

Future CMS boundary:

- page templates must read from an internal content access layer rather than directly from file format details
- phase 2 can swap repo-local collections for a headless CMS without rewriting layout components

### Styling strategy

Use modern CSS, not a utility-first framework, for the baseline architecture.

Reasoning:

- the current prototype already proves a custom token-driven aesthetic
- the design language depends on intentional surfaces, spacing, and typography rather than utility churn
- custom properties, cascade layers, component styles, container queries, and a small set of shared composition utilities are sufficient

Recommended style structure:

- `src/styles/tokens.css`
- `src/styles/base.css`
- `src/styles/utilities.css`
- component-local CSS files or Astro component style blocks

### Forms strategy

- replace `mailto:` forms with a serverless or server-side endpoint
- route submissions through a validation layer and anti-spam protection
- centralize consent and privacy microcopy
- return clear success and error states in-page

The exact hosting vendor can be chosen later, but the form interface must be framework-owned, not email-client-dependent.

### Metadata and structured-data strategy

- centralize page metadata in shared helpers
- generate canonical URLs, Open Graph, and Twitter/X cards per route
- generate `Organization`, `Event`, and later `NewsArticle` or `BlogPosting` schema from the structured content source
- generate sitemap entries from route/content collections rather than hand-maintaining XML

### Testing strategy

Baseline quality gates for the new app should include:

- formatting and linting
- type checking
- build validation
- broken-link checks
- accessibility checks for key templates
- Playwright end-to-end coverage for critical user journeys

## Why not continue the prototype unchanged

Keeping the prototype as the production codebase would force later prompts to solve architecture problems repeatedly:

- every new page would repeat the shell
- every content update would be manual and error-prone
- session logic would remain duplicated
- secure forms would be bolted on rather than designed in
- legal and metadata improvements would scatter across static files

Astro gives the project a cleaner migration target without sacrificing the performance and low-JS values that already make the prototype useful.

## Consequences

Positive:

- reusable components and layouts
- one source of truth for content-driven pages
- lower risk of copy drift and broken metadata
- better future CMS compatibility
- cleaner route and legal-page expansion

Costs:

- a new app root must be scaffolded
- content needs normalization before broad migration
- later prompts must work against the new app rather than patching `source/blurpint/`

## Implementation boundary for prompt 01

This prompt records the decision only.

It does not yet scaffold `site/`, migrate pages, or replace the prototype. That work belongs in later prompts after scope, IA, schema, and tooling are locked.
