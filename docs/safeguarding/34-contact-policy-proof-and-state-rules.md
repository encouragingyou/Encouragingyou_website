# Prompt 34 - Contact Policy Proof And State Rules

## Concern-intake decision

Prompt 34 does not leave safeguarding on `mailto:` as the primary route.

Instead:

- `site/src/content/formSurfaces/default.json` adds `safeguarding-concern`
- `site/src/lib/forms/enquiry-contract.js` allowlists the safeguarding hub and both branch routes
- `site/src/pages/api/enquiry.ts` and `site/src/lib/server/enquiry-service.js` continue to handle transport

The public email inbox remains available as a fallback and visible trust cue, not the primary digital route.

## Visible state surface

The safeguarding runtime now exposes these public states:

- immediate danger: emergency services first
- named safeguarding lead: not yet published publicly
- secure concern form: available
- public safeguarding inbox: available
- public full policy document: not yet published
- training/vetting statement: supported by the approved public brief
- general contact boundary: separate from safeguarding

## Policy and proof rules

- the site can state that safeguarding procedures are in place and followed
- the site can state that staff and volunteers are trained and vetted
- the site cannot invent a named safeguarding lead, direct line, or policy PDF
- the site cannot promise confidentiality, response times, or case-handling outcomes that are not defined

## Contact alignment

The secure safeguarding form intentionally differs from the general enquiry forms:

- only the safeguarding reason is allowed
- the reason field is hidden because the route already fixes the context
- updates opt-in is removed
- privacy copy is route-specific to safeguarding handling
- success copy explicitly says to call `999` if the risk becomes immediate

## Cross-route trust integration

- the shell header CTA for safeguarding-family pages now points to `/safeguarding/#safeguarding-concern`
- Contact, Volunteer, Partner, and other trust-heavy routes still link to the safeguarding hub rather than the general enquiry queue
- the safeguarding hub remains visible in primary navigation, footer navigation, and utility trust links
