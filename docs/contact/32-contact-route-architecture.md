# Prompt 32 - Contact Route Architecture

## Purpose

`/contact/` is now the high-trust fallback route for people who need help choosing the next step, are asking on behalf of someone else, or have a broader question that does not belong entirely to `Sessions`, `Volunteer With Us`, or `Partner With Us`.

It is not the only route into support.
The architecture now keeps four layers visible in order:

1. Intro and urgency boundary
2. Route-selection cards for already-clear paths
3. Contact-method cards plus the short enquiry shell
4. Location/service-area guidance plus FAQ

## Canonical data sources

- `site/src/content/contactInfo/default.json`
  - verified public email
  - phone publication state
  - venue disclosure policy
  - map-on-load policy
  - location guidance and safeguarding escalation target
- `site/src/content/siteSettings/default.json`
  - organisation name
  - service-area framing
  - social links
- `site/src/content/formSurfaces/default.json`
  - shared enquiry-surface copy and reason-selector rules
- `site/src/content/routePages/default.json`
  - contact-page narrative, route-selection, method-card, and location-section composition

## Runtime assembly

- `site/src/lib/domain/contact-route-state.js`
  - derives channel availability and location visibility state from canonical content
- `site/src/lib/content/site-content.ts#getContactPageModel`
  - resolves structured data, route cards, contact-method cards, location section, FAQ, urgent notice, and support-form props
- `site/src/pages/contact/index.astro`
  - renders the production route from the model
- `site/src/components/ui/ContactMethodCard.astro`
  - shared card abstraction for channel/status presentation

## Page sections

### Intro

- H1 changes to `We're here to help you find the right next step.`
- actions:
  - `Send a short message`
  - `Browse sessions`
  - `Read safeguarding`
- urgent danger is separated immediately from the generic enquiry path

### Route selection

The route-card section reuses the stable involvement-pathway family for:

- `join-session`
- `referral`
- `volunteer`
- `partner`

This keeps Contact from becoming a catch-all explanation page for flows that already have better public guidance.

### Contact methods and enquiry shell

The method grid now exposes:

- email as the primary public route
- phone as withheld until verified
- Instagram as a lighter social route
- safeguarding as a separate escalation path

The short enquiry form remains the shared `support-general` surface, and Prompt 33 now swaps its transport to the secure shared endpoint without redesigning the page.

### Location and FAQ

The location section now makes three things explicit:

- Rochdale is the public location anchor
- exact venue details can stay enquiry-led
- the contact page does not embed a live map on first load

## Structured data

The route now emits `ContactPage` schema with an organisation-backed `ContactPoint`.
Phone is only included if it is actually present in canonical content.

## Launch-state contract

- email: available
- phone: withheld until verified
- social: available if at least one public social link exists
- map: withheld unless a directions link is later approved
- venue detail: shared on enquiry unless public-address policy changes
- form transport: secure shared Astro endpoint with redirect fallback
