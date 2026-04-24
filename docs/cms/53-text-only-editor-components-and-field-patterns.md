# Prompt 53 - Text-Only Editor Components and Field Patterns

## Component layer

Prompt 53 introduces a dedicated admin component set separate from the public design system:

- `AdminLayout`
  Admin-only shell, navigation, role summary, and boundary banner.
- `AdminPanel`
  Reusable section card for dashboard panels, editor sections, preview, diff, and review surfaces.
- `AdminMetricCard`
  Dashboard metric surface.
- `AdminWorkstreamCard`
  Route-led entry point for content groups.
- `AdminDocumentCard`
  CMS record card linking into the editor.
- `AdminSurfaceCard`
  Surface-policy card showing ownership, mutation primitive, link policy, and the exposed fields.
- `AdminFieldControl`
  Text input, textarea, email input, or constrained select depending on field type.
- `AdminRepeatableGroup`
  Fixed-template repeatable editor with add/remove item controls inside the allowed structure.
- `AdminWorkflowActionBar`
  Draft, review, approve, publish, and revert actions, filtered by server-side role capability.

## Field patterns

- Plain text inputs
  Used for concise headings, labels, and identifiers.
- Long-text editors
  Used for summaries, descriptions, intros, policy-style paragraphs, and longer editorial copy.
- Constrained structured selectors
  Internal routes, page ids, and known external destinations are selected from allowlists instead of free-form URLs.
- Fixed-template repeatables
  Arrays render as grouped items with field controls per item. Editors may add and remove items, but cannot change the outer template.
- Locked fields
  Non-text or structurally sensitive values stay read-only with explicit explanation.

## Validation and guidance

- Character counts are visible at the field level.
- Validation errors render inline beside the affected field.
- Required-field and length checks update the workflow summary.
- Helper copy explains why the control is constrained and whether the field affects trust, routing, or publication safety.

## Editorial bias

The editor intentionally favors predictable form controls tied to the CMS schema over generic “blocks” or builder abstractions. This keeps the client operating inside the approved public templates rather than authoring presentation structure.
