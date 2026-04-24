# Prompt 47 - Security Failure Handling And Monitoring Hooks

## Automated hooks

- `npm run security:validate`
  - boots the built server
  - checks the live header set
  - verifies CSP hashes against the rendered HTML
  - asserts no inline style/event-handler drift
  - exercises cross-origin and oversized API rejection paths
- `npm run audit:policy`
  - runs `npm audit --json`
  - allows only the currently documented moderate Astro/checker holdovers
  - fails on unexpected package sources or higher-severity findings
- Playwright contract coverage now includes `tests/e2e/contracts/security-policies.spec.mjs`
- Unit coverage now includes `tests/request-guards.test.mjs` and `tests/security-policy.test.mjs`

## Runtime failure handling

- enquiry surfaces keep calm, non-revealing status copy
- malformed analytics and preference traffic receives minimal empty-body denial responses
- API routes stay uncached
- browser policy drift is catchable before release through the built-preview validator

## Monitoring boundaries

Available now:

- file-backed enquiry records
- file-backed aggregate analytics summaries
- CI advisory signal through `audit:policy`
- build-time header/CSP verification

Not yet wired because the repo does not contain verified operational targets:

- CSP report collector
- WAF or reverse-proxy abuse dashboards
- host-level request anomaly alerts
- on-call routing for security incidents

## Prompt 48 handoff requirement

Deployment work should connect these repo-level hooks to environment-level controls:

- production HTTPS and HSTS enforcement
- request logging and alert routing
- advisory visibility in CI/reporting
- any host/CDN translation of the middleware header policy without weakening the current CSP model
