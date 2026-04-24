# Prompt 53 - Locked Surface Policy and Client Guidance

## Client-visible boundary

The admin UI makes the CMS boundary visible instead of hiding it in backend rules only.

- Editable surfaces are labeled as client-editable text.
- Trust-critical or routing-sensitive surfaces are labeled as publisher-held.
- Layout, runtime, and rendering surfaces are labeled as locked.

## Locked by design

The client cannot use the admin portal to change:

- component ordering;
- layout regions;
- section composition;
- route creation;
- raw HTML, CSS, or JavaScript;
- embeds or iframe insertion;
- analytics, security, or runtime configuration;
- design tokens, motion rules, or component styling.

## Field-level guidance

- Text fields explain that copy changes are allowed but design is locked.
- Structured selectors explain that destinations must come from existing route or allowlist choices.
- Locked fields explain whether the reason is structural or privilege-based.

## Role guidance

- Client editors can draft and request review.
- Publishers own trust-critical identifiers, approval, publish, revert, and archive actions.
- Technical maintainers inherit publisher powers and remain responsible for schema, runtime, and operational recovery.

## Escalation path

When a change request genuinely affects layout, rendering, or runtime behavior, the admin portal directs the editor toward a developer change rather than offering an unsafe advanced mode.
