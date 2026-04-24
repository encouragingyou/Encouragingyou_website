# Prompt 48 - Post-Deploy Verification And Ownership

## Verification script

`site/scripts/verify-deployment.mjs` is the canonical post-deploy checker.

It verifies:

- `/api/health/` availability and reported release metadata
- release headers on HTML routes
- homepage, contact, privacy, and cookies route reachability
- footer trust-link reachability
- enquiry surface exposure on contact
- robots and sitemap behavior for the target channel
- analytics mode and `noindex` behavior for previews
- indexable discovery output for local or production

## Ownership

Ownership after a production deploy:

- GitHub Actions owns triggering the verification script
- the release approver owns deciding whether a failed verification blocks the release or triggers rollback
- the site maintainer owns Render dashboard follow-up, including rollback, disk checks, and preview lifecycle cleanup

## Minimal release evidence

Every production promotion should leave behind:

- the promoted SHA
- the release candidate artifact from `Site Release Candidate`
- the successful or failed `Site Production Promote` run
- Render deploy logs for the promoted release

That is the minimum evidence set for later debugging.

## Immediate post-deploy checklist

After `Site Production Promote` completes, the human approver should still scan:

- homepage and primary navigation on desktop and mobile
- `/contact/`, `/privacy/`, `/cookies/`, `/safeguarding/`
- one live session route
- one programme route
- the Render service health and event timeline

The automated verifier catches structure and policy regressions. The human check catches obvious editorial or visual surprises on the actual public origin.
