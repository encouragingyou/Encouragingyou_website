# Prompt 50 - Monitoring, Ownership, and Support Handover

## Launch-Day Ownership Rule

The repo can define roles, but it cannot invent the people. Before production promotion, replace the placeholders below with actual names or role-owned inboxes.

## Required Role Map

| Responsibility           | Minimum owner needed before launch | What they own                                                                                                                     |
| ------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Release decision owner   | `fill before go-live`              | Final go/no-go call, blocker closure, rollback authorization.                                                                     |
| Technical release owner  | `fill before go-live`              | GitHub Actions promotion, Render deployment, `/api/health/`, release verification, rollback execution.                            |
| Form inbox owner         | `fill before go-live`              | Monitoring `admin@encouragingyou.co.uk` and secure enquiry storage for contact, volunteer, partner, and general support messages. |
| Safeguarding owner       | `fill before go-live`              | Safeguarding route wording approval, secure concern inbox handling, escalation decisions, and any named-contact sign-off.         |
| Content and policy owner | `fill before go-live`              | Approval of contact wording, privacy/cookies/terms/accessibility updates, and post-launch content corrections.                    |
| Analytics reviewer       | `fill before go-live`              | Early interpretation of aggregate-only route and form signals, objection-state sanity, and anomaly review.                        |

## First Hour Monitoring

The technical release owner and release decision owner should monitor:

1. production workflow result
2. `/api/health/`
3. release headers on `/`
4. one successful visit each to `/contact/`, `/privacy/`, `/cookies/`, and `/safeguarding/`
5. one valid non-safeguarding form submission path
6. one analytics objection or resume action on `/cookies/`

Evidence to retain:

- release SHA
- release ID
- health response JSON
- any smoke-check screenshots or notes

## First 24 Hours

The form inbox owner, safeguarding owner, and technical release owner should monitor:

1. whether enquiries are being written and handled
2. whether any safeguarding messages need urgent follow-up
3. whether analytics storage remains writable
4. whether any legal-route contradictions are reported
5. whether any 404 or broken-link reports surface through the accessibility or contact route

Evidence to retain:

- first successful enquiry handling note
- first safeguarding-path check note
- any incident or rollback decision log

## First Week

The content/policy owner and analytics reviewer should monitor:

1. repeated content questions that suggest missing phone, safeguarding, or session-access facts
2. accessibility feedback themes
3. route drop-off patterns on contact, sessions, volunteer, and partner flows
4. whether the accepted legal and trust omissions stay acceptable in practice
5. whether partner-proof, photography, or deeper editorial asks need promotion from backlog to active work

## Support Routing Expectations

| Issue type                             | First owner              | Escalate to                                   |
| -------------------------------------- | ------------------------ | --------------------------------------------- |
| Broken page or deploy failure          | Technical release owner  | Release decision owner                        |
| Form submission failure                | Technical release owner  | Form inbox owner and release decision owner   |
| Safeguarding wording or intake concern | Safeguarding owner       | Release decision owner                        |
| Privacy, cookies, or terms mismatch    | Content and policy owner | Release decision owner                        |
| Public-content correction              | Content and policy owner | Technical release owner if a deploy is needed |
| Analytics anomaly                      | Analytics reviewer       | Technical release owner                       |

## What Must Be True Before The Team Stands Down

1. Production promotion has completed on the intended release.
2. Manual smoke checks are recorded.
3. The release/incident owner knows whether the site is still in heightened watch.
4. Inbox handling is confirmed for contact and safeguarding routes.
5. The open post-launch backlog is handed over intentionally, not left as implied debt.
