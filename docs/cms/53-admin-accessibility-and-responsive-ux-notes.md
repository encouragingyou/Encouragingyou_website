# Prompt 53 - Admin Accessibility and Responsive UX Notes

## Accessibility posture

The admin portal reuses the project’s accessibility expectations but applies them to dense editorial tooling rather than the public website.

- Navigation remains shallow and keyboard reachable.
- Buttons and links preserve visible focus states.
- Field errors render inline near the affected control.
- Character counts and helper text stay present in the DOM rather than hidden behind tooltips.
- Review and workflow states are communicated in plain language instead of icon-only status.

## Responsive behavior

- The admin shell collapses from a two-column sidebar layout to a stacked mobile layout.
- Editor pages use a split layout on larger screens and stack the form and preview rails on smaller screens.
- Action buttons wrap and become full-width on small screens.
- Repeatable item controls remain reachable without horizontal scrolling.

## Cognitive load decisions

- The primary nav has only three destinations.
- Editors enter content through workstreams first, not schema ids.
- Preview and diff are adjacent to the editor rather than hidden behind separate tooling.
- Locked-surface messaging is repeated in context so editors do not have to remember the system boundary.

## Known temporary limitation

Prompt 53's placeholder-role limitation is resolved by Prompt 54. Browser-local draft recovery remains a UX convenience only until later prompts move more editorial persistence fully into the isolated admin runtime.
