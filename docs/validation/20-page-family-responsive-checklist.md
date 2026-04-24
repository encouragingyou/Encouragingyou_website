# Prompt 20 - Page Family Responsive Checklist

Prompt 20 extends the shared responsive suite so the first real programme-detail route is checked across the existing viewport matrix.

## Viewports Verified

| Viewport | Size |
| --- | --- |
| mobile | `390x844` |
| tablet | `834x1194` |
| laptop | `1280x800` |
| desktop | `1536x960` |
| wide-desktop | `1728x1117` |

Source:

- `site/tests/e2e/support/viewports.mjs`

## Community & Friendship Checks

At every viewport, the responsive suite now verifies:

- page loads without horizontal overflow
- the `h1` clears the sticky header
- the primary `See live route` action remains visible
- FAQ content remains reachable
- the `Public-proof boundary` notice remains present

Primary test location:

- `site/tests/e2e/contracts/responsive-behavior.spec.mjs`

## Family-Level Expectations To Reuse

Prompts 21-23 should keep these responsive rules for all programme-detail routes:

- detail pages must not require sideways scrolling
- the first route-defining action must remain easy to find
- sticky shell behavior must not obscure the first heading
- trust or honesty surfaces must not disappear at smaller breakpoints
- linked-session handoff surfaces must remain readable at both narrow and wide widths

## Manual Watchpoints

Even with automated coverage, future prompts should still check for:

- overgrown hero copy pushing all actions too far down
- badge rows wrapping into unreadable blocks
- sidebar content collapsing into confusing order on tablet widths
- session cards and notice panels losing contrast or hierarchy when stacked
