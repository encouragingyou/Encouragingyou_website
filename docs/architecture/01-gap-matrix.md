# Gap Matrix

Date: 2026-04-22

## Summary

The prototype is materially behind the launch shape described in the blueprint and PDF brief. The gaps below are ordered by delivery risk, not by visual importance.

| Area | What exists in `source/blurpint` | Gap against blueprint and PDF | Priority | Outcome required |
| --- | --- | --- | --- | --- |
| Information architecture | 8 routes: Home, About, Sessions, 2 session details, Get Involved, Safeguarding, Privacy | Missing Programmes overview, 4 programme detail pages, Events & Updates index, event/update templates, Contact page, Volunteer page, Partner page, Accessibility Statement, Cookies page, Terms/Site Policy, 404 route | Critical | Lock a launch sitemap that reflects real user journeys and trust routes |
| Content coverage | Good draft content for home, about, sessions, and get involved | Missing broader community support detail, programme detail content, volunteer/partner proof, referrer guidance, updates/events content, contact guidance, fuller trust content | Critical | Create structured launch content modules and page templates |
| Data modeling | All content hardcoded in HTML; two sessions also modeled in JS and ICS files | No single source of truth for sessions, programmes, events, FAQs, legal copy, or contact details | Critical | Introduce typed content collections or CMS-backed models |
| Legal and compliance | Privacy and safeguarding summary pages are visible | Missing production-ready privacy notice, cookie decisioning, accessibility statement, terms/site policy, named safeguarding contact, real data-flow handling, form consent language beyond simple inline notes | Critical | Build high-trust legal and consent architecture grounded in actual operations |
| Forms and conversion | Contact and involvement forms post to `mailto:`; other CTAs are email links | No server validation, no spam protection, no success/error states, no routing logic, no audit trail, poor mobile/device reliability | Critical | Replace with secure serverless or server-side forms |
| Routing and maintainability | Flat static files with duplicated header/footer markup | Shared shell is copied into every page, making future edits brittle and drift-prone | Critical | Move to componentized layouts and shared route templates |
| Deployment readiness | Static files served via `python3 -m http.server`; minimal `package.json` | No framework build, no preview deploys, no CI/CD, no rollback path, no environment strategy | Critical | Stand up a real application root with build and deploy workflow |
| SEO and discoverability | Page titles, descriptions, home-page OG tags, home `Organization` schema, basic sitemap and robots | No canonical tags, inconsistent social metadata, client-injected event schema only, no update/event discovery model, no page-template metadata system | High | Centralize metadata and structured data generation |
| Accessibility | Skip link, semantic headings, focus styles, reduced motion, reasonable hit areas, disclosure copy present | No accessibility statement, no automated checks, no dedicated mobile navigation pattern, no audit baseline for contrast, link purpose, or form error handling | High | Preserve current wins and add testable accessibility guarantees |
| Responsiveness | Responsive images, container queries, mobile-safe single-column fallbacks | Mobile home nav stacks into the hero rather than using a dedicated interaction model; no explicit responsive QA baseline across page types | High | Rebuild the shell and navigation with deliberate mobile behavior |
| Trust and credibility | Visible safeguarding and privacy links; AI-art disclosure captions; warm, grounded tone | No real contact page, no operational proof for training/vetting, no partner or funder credibility content, no real-photo handoff plan on site | High | Make trust signals explicit throughout the launch IA |
| Editorial workflow | None beyond editing static files | No content governance, reusable schema, review path, or future CMS bridge | High | Define repo-structured content now and preserve headless CMS compatibility |
| Session and event logic | Two recurring Saturday sessions represented in HTML, JS, and ICS | No future-proof event model, no update/news model, no build-time generation from one source, no upcoming/past logic | High | Normalize recurring sessions and events into structured data |
| Component system | Reusable visual patterns exist implicitly in HTML/CSS | No actual component library, no tokenized foundations, no composition rules, repeated markup across pages | High | Extract components into a system before large-scale migration |
| Asset pipeline | Raw artwork preserved; responsive image build script exists | No asset manifest, no SVG icon pipeline, no tie between media usage and content data, no documented ownership of disclosures | Medium | Keep the raw-artwork pipeline, but formalize asset metadata and usage rules |
| Typography and brand fidelity | Current site uses Atkinson Hyperlegible and custom CSS variables | Blueprint recommends Inter plus optional Newsreader; tokens are local to one CSS file rather than a system-level design token layer | Medium | Normalize brand tokens and typography in the new app |
| Performance baseline | Local assets only, responsive images, light JavaScript | No formal budgets, no cache strategy, no build-time asset auditing, no font loading strategy beyond one local face | Medium | Preserve low-JS approach while adding measurable budgets |
| Analytics and measurement | None | No privacy-conscious analytics, no event tracking for enquiries or session interest | Medium | Add minimal, consent-aware measurement later in the stack |
| QA automation | Existing manual Playwright artifacts only | No automated accessibility, broken-link, HTML validity, or journey tests | Medium | Introduce test gates as part of the new app bootstrap |

## Immediate implications

- Extending the static prototype page by page will increase duplication and rework.
- The route structure should change before later prompts start building more pages.
- Session and event data need normalization before new programme and updates work begins.
- Legal, trust, and form handling are launch-critical blockers, not polish items.

## Recommended response to the matrix

Use the matrix to drive the next prompts in this order:

1. Lock launch scope and trust requirements before more page migration.
2. Choose the final IA and content model before adding routes.
3. Stand up the new application root before rebuilding templates.
4. Treat `source/blurpint` as a source reference, not the destination architecture.
