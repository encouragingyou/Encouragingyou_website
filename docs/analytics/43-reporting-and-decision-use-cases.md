# Prompt 43 - Reporting And Decision Use Cases

## Reporting Principle

The measurement layer exists to answer a small number of operational product questions.

If a metric does not support a concrete site decision, it should not be collected.

## Core Views

### 1. First-Step Conversion

Primary inputs:

- `page_view`
- `cta_click`

Questions answered:

- Which entry routes produce the next step most often?
- Are people moving from trust/content routes into sessions, programmes, or contact?
- Are header and hero CTAs doing useful work, or just duplicating each other?

Likely decisions:

- simplify or reorder homepage CTA hierarchy;
- change header CTA defaults by route family;
- remove low-value duplicate CTAs.

### 2. Programme And Session Interest

Primary inputs:

- `page_view`
- `calendar_download_requested`
- `form_submitted`

Questions answered:

- Which programme routes attract interest but fail to produce a next step?
- Which session routes create stronger action than overview routes?
- Are calendar files still useful enough to keep prominent?

Likely decisions:

- rewrite weak programme intros or reassurance copy;
- adjust session-to-programme bridge placements;
- reduce emphasis on calendar download where enquiry is the real action.

### 3. Involvement Pathway Performance

Primary inputs:

- `page_view`
- `cta_click`
- `form_submitted`

Questions answered:

- Are people using `Get Involved` as a real router?
- Which routes actually convert to volunteer or partner enquiries?
- Are supporter/opportunity routes earning clicks without creating a clear next step?

Likely decisions:

- change pathway order or spotlight priority;
- tighten volunteer and partner action wording;
- remove routes that are browsed but not acted on.

### 4. Form Friction And Completion

Primary inputs:

- `form_start`
- `form_validation_failed`
- `form_submitted`

Questions answered:

- Which forms attract intent but lose people before submit?
- Are failures clustered on the same field category?
- Is the shared form shell helping or creating avoidable friction?

Likely decisions:

- improve helper copy for the dominant failing field;
- shorten or reposition reassurance copy;
- split a surface only if the shared shell proves misleading.

### 5. Trust And Legal Engagement

Primary inputs:

- `page_view` on `trust` routes
- trust-destination `cta_click`

Questions answered:

- Are people using privacy/cookie/accessibility/legal routes near decision points?
- Which routes drive trust-route visits most often?
- Is the Cookie Notice objection control being used?

Likely decisions:

- move trust links closer to the relevant conversion surface;
- keep or remove repeated trust cues based on real usage;
- review whether analytics scope still matches visitor expectations.

## What Not To Report

- total users as a vanity KPI
- average time on site without a related decision
- per-page engagement scores without a route-change plan
- demographics, age buckets, or inferred vulnerability traits
- “top clickers” or any per-person ranking

## Safe Interpretation Rules

- treat counts as directional product evidence, not proof about specific people;
- prefer route-family patterns over single-page spikes;
- use trust-route engagement as reassurance evidence, not as a target to maximize blindly;
- never combine analytics summaries with enquiry records to profile individuals;
- if a future question needs person-level behavior, the answer is to reject the question or redesign the approach, not to expand the tracking scope.
