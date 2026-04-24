# Prompt 32 - Urgency, Reason, and Routing Model

## Routing hierarchy

The Contact route now distinguishes between:

1. Session questions
2. Referral-style first contact
3. Volunteer enquiries
4. Partnership enquiries
5. General or unsure-first contact
6. Safeguarding or urgent concerns

## What goes where

### Sessions

- Use `Sessions` when someone already wants a live Saturday route.
- Contact stays available when a parent, carer, or participant wants to ask first.

### Referral-style contact

- Uses the existing `referral` pathway state.
- Keeps wording safe for parents, carers, schools, and community referrers.
- Encourages short context first instead of forcing a formal referral workflow.

### Volunteer and partner

- Contact no longer has to explain those routes from scratch.
- It points visitors into the dedicated route pages when the pathway is already clear.

### General or unsure-first contact

- The shared `support-general` enquiry shell remains the fallback for:
  - broad questions
  - mixed needs
  - asking on someone else's behalf
  - route uncertainty

## Reason-selector contract

The Contact form still uses the shared taxonomy in `contactInfo.reasonOptions`:

- `join-session`
- `cv-support`
- `volunteer`
- `partner`
- `referral`
- `general`

Prompt 32 tightened the visible helper copy in `formSurfaces/default.json` but did not fork the taxonomy.
That keeps Prompt 33 free to replace transport without changing page meaning.

## Urgency segmentation

### Immediate danger

- never routed through the generic contact queue
- message stays: call `999`

### Safeguarding concerns

- routed to `/safeguarding/`
- surfaced in:
  - hero action
  - urgent notice action
  - dedicated contact-method card
  - referral pathway trust framing

### General urgency

- remains proportionate
- handled by short enquiry plus visible privacy/safeguarding context

## JS and no-JS behavior

- with JS: shared validation and first-invalid-field focus remain active
- without JS: route cards, method cards, FAQ disclosure, and the enquiry form still render and submit through the redirect-based secure form fallback
