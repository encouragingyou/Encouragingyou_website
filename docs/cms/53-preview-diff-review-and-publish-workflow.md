# Prompt 53 - Preview, Diff, Review, and Publish Workflow

## Working model

Prompt 53 delivers the editorial workflow shell without attaching public publication writes yet.

- Published content remains the immutable baseline imported in Prompt 52.
- Each admin document editor starts from that published baseline and opens a working draft in the isolated admin browser workspace.
- Draft state is stored in admin-local browser storage for autosave and recovery.

## Editor states

- Unsaved changes
  Triggered immediately after a field changes.
- Draft saved
  Set after local autosave or explicit save.
- Validation blocked
  Triggered when required or over-limit fields prevent review or publish.
- Under review
  Triggered by `Request review`.
- Approved
  Triggered by `Approve`.
- Published
  Triggered by `Publish`, which updates the admin-side published snapshot for diffing and rollback readiness.
- Reverted
  Triggered by `Revert to published`, restoring the last published admin-side snapshot.

## Preview model

- Preview stays inside the admin portal.
- The preview is a route-impact reading surface, not a design-editing tool.
- It highlights the text that will change in the fixed public presentation language.
- Editors are never given component ordering, layout controls, style editing, or arbitrary markup injection.

## Diff model

- Diff compares current draft values against the last published snapshot.
- Approvers read changed fields only.
- Before and after values are rendered in a compact card list.

## Review queue

- The review queue route is limited to roles that can approve, publish, or revert.
- It is populated from the isolated admin workspace rather than public routes.
- The queue is role-aware and intentionally not exposed through public navigation or discovery artifacts.

## Publication caveat

Prompt 53 deliberately stops short of attaching real authenticated server-side publication writes. Prompt 54 and Prompt 55 will secure that boundary, wire durable audit trails, and connect the final publication event to the isolated admin origin.
