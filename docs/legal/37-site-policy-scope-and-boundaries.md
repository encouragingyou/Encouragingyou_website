# Prompt 37 - Site Policy Scope and Boundaries

## Objective

`/terms/` is now a practical site policy for the live EncouragingYou launch build.
It is not a generic SaaS terms page and it is not a second privacy notice.

## Canonical sources

- `site/src/content/sitePolicy/default.json`
- `site/src/pages/terms/index.astro`
- `site/src/content/legalPages/default.json`
- `site/src/content/routePages/default.json`

## Separation of responsibilities

### Privacy Notice

Covers:

- personal data collection points
- current processors and handling model
- rights, retention, sharing, and safeguarding intake differences

Does not need to carry:

- acceptable use rules
- intellectual-property boundaries
- general site-accuracy and external-link limits

### Cookie Notice

Covers:

- the current storage/access registry
- why launch uses `no-banner`
- future consent change triggers

Does not need to carry:

- general acceptable use or site-purpose language

### Accessibility Statement

Covers:

- accessibility posture
- evidence basis
- known limitations
- accessibility feedback route

Does not need to carry:

- broader acceptable use or IP rules

### Terms / Site Policy

Covers:

- what the public site is for
- fair/use boundaries around forms and public contact routes
- urgency and non-advice boundaries
- external-link and download boundaries
- content/brand reuse limits
- review triggers when the feature set grows

## Launch feature fit

The route is deliberately calibrated to the real launch footprint:

- public information routes
- session and programme pages
- `.ics` calendar downloads
- contact, volunteer, partner, safeguarding, and accessibility feedback forms
- external social/email destinations
- no accounts, payments, comments, uploads, or member dashboards

## Boilerplate explicitly excluded

The site policy should not introduce terms for features that do not exist:

- account suspension clauses
- payment or refund clauses
- subscription billing terms
- user-generated content licensing for public uploads
- community moderation rules for comments or forums
- app-store, API, or enterprise-service language

## Boundary decisions

### Acceptable use

Keep the language simple and enforceable:

- no spam, impersonation, abuse, or deliberate misuse of forms
- no attempts to break or overload the public site
- no knowingly false or harmful submissions

### Information and urgency

Keep route honesty visible:

- live pages are maintained in good faith but are not an absolute guarantee that details can never move
- urgent danger belongs with emergency services
- safeguarding concerns belong on safeguarding routes, not in general-contact copy

### External links and downloads

The policy should state that:

- outside services control their own accessibility, privacy, and account behavior
- `.ics` files are a convenience helper, not a separate controlled platform
- the live page remains the source of truth when dates or details change

### Content and brand reuse

The policy should protect the organisation without sounding hostile:

- ordinary linking and referral behavior is fine
- misleading reuse of brand, copy, or launch media is not

## Review triggers

The policy must be reviewed when the launch footprint changes materially, especially if the site adds:

- analytics or consent tooling
- public uploads or user accounts
- payments
- embedded maps or other third-party runtime features
- new downloadable resources beyond the current calendar pattern

## Output

- Canonical policy content: `site/src/content/sitePolicy/default.json`
- Production route: `site/src/pages/terms/index.astro`
