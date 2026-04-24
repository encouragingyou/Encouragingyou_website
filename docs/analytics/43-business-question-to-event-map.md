# Prompt 43 - Business Question To Event Map

## Scope

This prompt introduces a first-party measurement layer for service-improvement questions only.

- It is not an advertising stack.
- It is not user profiling.
- It is not a case-management or safeguarding-monitoring tool.
- It is constrained to aggregate route, CTA, calendar, and form-progress signals.

## Primary Questions

| Business question | Signal(s) used | Why this is enough | What is intentionally excluded |
| --- | --- | --- | --- |
| Which landing routes lead people to the next step? | `page_view`, `cta_click` | `page_view` captures entry type and source family; `cta_click` captures high-signal button journeys. | Scroll maps, heatmaps, replay, fingerprinting, individual visitor trails |
| Which programme and session routes create genuine interest? | `page_view`, `calendar_download_requested`, `form_submitted` | Page views show route demand; calendar intent and successful enquiries show stronger downstream interest. | Per-user dwell scoring, individual click histories, content-level surveillance |
| Which enquiries convert successfully? | `form_start`, `form_validation_failed`, `form_submitted` | These distinguish intent, friction, and successful handoff without storing message content. | Names, emails, phone numbers, message text, hidden spam details |
| Are volunteer and partner pathways being used? | `page_view`, `cta_click`, `form_submitted` on `volunteer-enquiry` and `partner-enquiry` surfaces | Enough to compare route demand with actual enquiry completions. | Audience segmentation, retargeting, external platform matching |
| Are trust and legal routes being used as reassurance surfaces? | `page_view` on `trust` route family, plus trust-destination CTA flow from support surfaces | Lets the team see whether people actually use privacy/cookie/accessibility/legal routes near conversion points. | Monitoring legal reading depth per person |
| Are calendar downloads still valuable? | `calendar_download_requested` | A direct file request is the clearest privacy-safe expression of calendar intent. | File-open tracking inside the user’s calendar app |

## Route Families Used In Reporting

- `home`
- `about`
- `programmes`
- `sessions`
- `get-involved`
- `contact`
- `updates`
- `trust`
- `unknown`

## Explicitly Forbidden Measurement

- Session replay, heatmaps, rage-click tooling, or cursor logging
- Advertising pixels, remarketing tags, affiliate measurement, or cross-site matching
- Visitor IDs, device fingerprinting, or cross-visit profiling
- Free-text form content, names, emails, phone numbers, or safeguarding detail in analytics payloads
- Safeguarding-route interaction analytics beyond ordinary service delivery
- Query-string secrets, campaign enrichment tied to a person, or inferred vulnerability scoring

## Route-Level Boundary

- `safeguarding`, `safeguarding-child`, and `safeguarding-adult` are excluded from page-view analytics.
- Safeguarding form submissions are excluded from analytics conversion recording.
- The contact and support routes are measured only at coarse surface level, never at message-content or reason-detail level.
