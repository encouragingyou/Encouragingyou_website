# Prompt 11 Shared Notice Surface Model

Prompt 11 defines three notice scopes so trust cues stop being improvised banners.

## Scope model

### 1. Shell-injected notices

These are route-aware notices rendered by `ShellWayfinding` before page content.

Current prompt 11 implementation:

- `service-area-venue`
  - routes: `/sessions/`, `/contact/`
  - reason: those routes need public location clarity before deeper engagement

Source of truth:

- notice definition: `site/src/content/notices/default.json`
- placement rule: `site/src/content/shellConfig/default.json`

### 2. Component-scoped notices

These stay attached to the component where the trust question actually arises.

Current prompt 11 implementation:

- support-form privacy reminder inside `site/src/components/forms/SupportForm.astro`
- AI illustration disclosure through `DisclosureNote` next to illustration-bearing components

These are intentionally not promoted into the shell band because they are most useful at the exact interaction point.

### 3. Page-scoped notices

These are still rendered locally when the content belongs to one page shape, not the whole shell.

Current examples:

- placeholder migration notes in `LaunchPlaceholder`
- urgent help notes on contact and session detail pages
- privacy launch-note panel on `/privacy/`

## Ownership rules

- shell notices should explain route-wide context or constraints
- component notices should sit next to the interaction or media that creates the trust question
- page notices should stay local when they describe one route’s temporary state or route-specific escalation copy

## Non-goals in prompt 11

- no global site-wide announcement bar was added yet
- no service-status or cookie-consent banner was invented early
- no AI-art disclosure was moved into a universal banner; it remains attached to the media surfaces where it matters

That keeps the notice system focused and avoids training the UI into banner fatigue before launch content is final.
