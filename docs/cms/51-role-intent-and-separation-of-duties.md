# Prompt 51 - Role Intent and Separation of Duties

## Roles

The CMS operating model now assumes three roles.

### Client editor

Intent:

- draft changes to approved copy fields
- revise existing copy
- request review
- inspect diffs

Cannot:

- publish
- revert published content
- edit trust-critical operator fields
- manage schema or mappings
- manage access, secrets, or runtime configuration

### Publisher

Intent:

- review client drafts
- edit operator-controlled trust/legal fields
- approve and publish
- archive or revert content
- inspect audit logs

Cannot:

- change schema or field boundaries
- manage infrastructure secrets or runtime configuration

### Technical maintainer

Intent:

- own schema, mappings, admin runtime, secrets, and deployment
- support emergency recovery and rollback
- manage editor access
- evolve publication contracts

Can:

- do everything a publisher can do
- plus platform and schema work

## Separation Of Duties Rules

1. Client editors can prepare content but cannot release it.
2. Publishers can release content but cannot silently widen schema or mutation boundaries.
3. Technical maintainers can change boundaries and runtime, but those changes remain code-reviewed and developer-owned.

## Why Safeguarding, Legal, and Contact Fields Are Narrower

These fields are intentionally not delegated to end-client editing by default:

- safeguarding route copy
- named-contact or policy availability states
- privacy and cookie notice content
- accessibility statement content
- public phone/email/social identifiers
- session operational metadata such as price, referral, or schedule status

Those surfaces affect trust, legal truth, or public operational promises and therefore stay operator-controlled.

## Publication Model

The role model assumes:

- editors create drafts
- publishers promote drafts to published state
- maintainers protect schema/runtime boundaries

Prompt 52 should preserve that model when it introduces a versioned editorial state machine.
