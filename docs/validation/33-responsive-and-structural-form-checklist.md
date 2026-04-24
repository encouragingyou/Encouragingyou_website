# Prompt 33 Responsive And Structural Form Checklist

Date: 2026-04-23

## Structural Guarantees

- every key enquiry route still has one clear `h1`
- `SupportForm` keeps visible labels for name, email, reason, and message
- field-level errors remain attached to the correct control
- privacy visibility stays inside the enquiry panel
- safeguarding remains visible near Contact, Volunteer, and Partner flows
- session-detail `Ask to join` no longer points at `mailto:`
- no enquiry form uses `GET`
- no enquiry form uses `mailto:` as its primary transport

## Responsive Guarantees

- Contact keeps method cards and the secure form readable without horizontal overflow
- Get Involved keeps the shared enquiry shell below the pathway content on mobile
- Volunteer keeps role cards, safeguarding cue, and enquiry panel visible across the viewport matrix
- Partner keeps collaboration cards, proof boundary, and enquiry panel visible across the viewport matrix
- session detail routes keep the `Ask to join` CTA visible in the hero without overlap

## Fallback Guarantees

- form still renders when JavaScript is disabled
- no-JS submissions return to the same route with a status message
- hidden anti-bot controls do not disrupt keyboard or screen-reader flow
- the direct email fallback remains available even if secure submission fails
