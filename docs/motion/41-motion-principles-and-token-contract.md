# Prompt 41 - Motion Principles And Token Contract

Prompt 41 turns motion into a shared interaction system instead of scattered hover and reveal rules.

## Design intent

- motion should help orientation, confirmation, and wayfinding before it ever adds personality
- movement should feel calm and deliberate rather than playful or theatrical
- trust-heavy routes can use structural polish, but never novelty animation
- in-page transitions are preferred over route-transition effects

## Named motion roles

### `structural`

Used for:

- sticky header state shifts
- mobile navigation drawer open and close
- shell surfaces such as footer and wayfinding bands
- card and panel surface settling

Token path:

- `--theme-motion-structural`
- `--component-transition-shell`

### `emphasis`

Used for:

- buttons
- interactive cards
- filter chips
- navigation links on hover/focus

Token path:

- `--theme-motion-emphasis`
- `--component-transition-interactive`

### `feedback`

Used for:

- field labels and controls
- summary rows inside disclosure patterns
- notice surfaces that change tone or affordance

Token path:

- `--theme-motion-feedback`
- `--component-transition-control`

### `reveal`

Used for:

- homepage hero copy
- page intros
- footer lead/support blocks
- route and card surfaces where a subtle in-view settle improves scan order

Token path:

- `--theme-motion-reveal`
- `--component-transition-reveal`

### `dismiss`

Reserved for:

- future dismissible notices or preference surfaces

Current status:

- modeled in tokens as `--theme-motion-dismiss`
- not yet attached to any public dismiss interaction at launch

### `confirm`

Used for:

- support-form status messages
- other explicit success/error/neutral feedback surfaces

Token path:

- `--theme-motion-confirm`
- `--component-transition-confirm`

## Primitive timing and distance tokens

The motion layer now relies on explicit low-level tokens in `site/src/styles/tokens.css`.

- durations: `--motion-duration-instant`, `--motion-duration-fast`, `--motion-duration-base`, `--motion-duration-slow`, `--motion-duration-slower`
- easing: `--motion-ease-standard`, `--motion-ease-entry`, `--motion-ease-exit`, `--motion-ease-emphasis`
- distance: `--motion-lift-distance`, `--motion-press-distance`, `--motion-reveal-distance`, `--motion-drawer-distance`
- sequencing: `--motion-stagger-step`
- reveal visibility floor: `--motion-opacity-soft`

## Semantic runtime variables

The route-facing CSS should use semantic variables from `site/src/styles/theme.css`, not raw timing tokens.

- `--theme-motion-lift-distance`
- `--theme-motion-press-distance`
- `--theme-motion-reveal-distance`
- `--theme-motion-drawer-distance`
- `--theme-motion-reveal-opacity`

This keeps reduced-motion overrides centralized instead of forcing component-level exceptions.

## Attribute contract

Components express motion intent through `data-motion` tokens.

- `data-motion="structural"` for shell/state transitions
- `data-motion="emphasis"` for interactive lift/hover behavior
- `data-motion="feedback"` for control and disclosure feedback
- `data-motion="confirm"` for explicit success/error notices
- `data-motion="reveal"` for safe in-view settling

The current shared implementation uses these hooks in:

- `SiteHeader`
- `ShellWayfinding`
- `SiteFooter`
- `HomeHero`
- `PageIntro`
- `CardPanel`
- `Button` and `ButtonLink`
- `NoticeBlock`
- `AccordionGroup`
- `SupportForm`
- `FormField`

## Explicit rejections

Prompt 41 deliberately does not add:

- route-transition animation
- parallax
- autoplay or looped hero motion
- animated counters
- carousel choreography
- trust-surface novelty effects

That is a product decision, not missing polish.
