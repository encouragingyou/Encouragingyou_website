# Homepage Decision Architecture

Prompt 16 redefines the homepage as the site's highest-priority decision surface rather than a hero-led brochure.

## Diagnosis

- The existing route was strong visually, but it over-weighted the Saturday-session story.
- Trust cues were present too late and one trust block linked every card to safeguarding, which blurred meaning.
- The wider programme picture was under-represented because the homepage only surfaced three programmes and routed the broader community block back to sessions.
- Volunteer, partner, and community-member pathways existed, but they were treated like parallel afterthoughts instead of a supporting conversion lane.
- The route had no explicit state surface for session availability, updates absence, contact-data readiness, AI-art disclosures, or shell notices.

## Final decision hierarchy

Primary action:
- `Join a session`

Secondary action:
- `Get support`

Supporting actions:
- `Get CV help`
- `See all programmes`
- `Volunteer or partner`

Trust actions that support decision-making, not compete with the main CTA stack:
- `Why EncouragingYou exists`
- `Safeguarding information`
- `Privacy notice`

## Audience handling

- Young people: reduce friction into sessions or support.
- Parents, carers, and referrers: keep trust, privacy, and safeguarding visible before commitment.
- Community members: show that the offer extends beyond Saturday attendance.
- Volunteers and partners: route to `Get involved` or direct contact without forcing them through support-first messaging.

## Canonical implementation

The homepage strategy now lives in:

- `site/src/content/homePage/default.json`
- `site/src/content/updatesFeed/default.json`
- `site/src/lib/content/site-content.ts`

The canonical model now exposes:

- a homepage action map
- a conversion stack by audience
- an ordered section sequence
- explicit state/fallback rules
- launch boundaries for what stays on the homepage now versus what belongs to later routes

## Final section sequence

1. Hero
2. Quick actions
3. Trust strip
4. Live sessions
5. Programme teasers
6. About teaser
7. Wider community support feature
8. Updates surface
9. Involvement CTA
10. FAQ cluster
11. Contact panel

This order keeps first-step clarity at the top, trust early, broader programme understanding mid-page, and support/contact routes visible before the footer.
