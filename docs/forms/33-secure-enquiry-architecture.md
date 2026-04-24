# Prompt 33 Secure Enquiry Architecture

Date: 2026-04-23

## Decision

The site now uses a server-capable Astro runtime for enquiry handling.

- `site/astro.config.mjs` now runs with `output: "server"` and `@astrojs/node`
- detail routes that do not need request-time state are explicitly `prerender = true`
- shared enquiry processing lives at `site/src/pages/api/enquiry.ts`
- shared request normalization and validation live in `site/src/lib/state/support-form.js`
- route/context/query contracts live in `site/src/lib/forms/enquiry-contract.js`
- server-side abuse defense and storage live in `site/src/lib/server/enquiry-service.js`

## Public Flow

1. A user reaches a shared `SupportForm` on Home, Contact, Get Involved, Volunteer, Partner, or Safeguarding.
2. The form submits `POST` form data to `/api/enquiry`.
3. Client-enhanced submissions request JSON and keep the user on the same route with inline status messaging.
4. No-JS submissions use Post/Redirect/Get and return to the same route with a trustworthy status message anchored back to the enquiry panel.
5. Session-detail `Ask to join` CTAs no longer open `mailto:` drafts. They now route into `/contact/` with a validated enquiry context.

## Canonical Inputs

### Surface truth

`site/src/content/formSurfaces/default.json`

- visible heading, intro, helper text, submit label
- reason allowlist per surface
- default reason where needed
- route-specific success copy

### Reason taxonomy and routing truth

`site/src/content/contactInfo/default.json`

- public reason IDs and labels
- target audiences
- internal `routingKey` for workflow classification

### Context truth

`site/src/lib/forms/enquiry-contract.js`

- supported origin paths per surface
- session-to-contact context bridge
- redirect/query-state contract

## Transport Choice

Prompt 33 intentionally does not invent a third-party form processor.

Instead, the chosen launch-safe transport is:

- server-side validation in Astro
- append-only JSON queue records in `ENQUIRY_STORAGE_DIR`
- default local path: `site/var/enquiries`

This gives the repo a real secure processing path without pretending a CRM or email relay exists.

## Remaining Acceptable `mailto:` Usage

`mailto:` is still acceptable only as a plain contact option, not as the primary submission mechanism.

Acceptable examples:

- footer contact email
- direct email links on legal or safeguarding information where the UI is explicitly offering email as an option
- the email fallback link below `SupportForm`

No longer acceptable:

- primary contact form transport
- volunteer or partner enquiry transport
- session `Ask to join` transport

## Storage Shape

Each successful submission is stored as one JSON record containing:

- reference ID and received timestamp
- surface ID and validated origin path
- optional session context
- reason ID, label, and routing key
- sender name, email, and updates opt-in
- message body
- minimal request metadata with hashed IP, user agent, and origin/referrer

Raw IP addresses are not stored in the submission record.
