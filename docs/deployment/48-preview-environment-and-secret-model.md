# Prompt 48 - Preview Environment And Secret Model

## Preview strategy

The site uses Render pull-request service previews with `previews.generation: manual`.

Manual was chosen over automatic because:

- the site already has broad local and CI browser coverage
- preview instances are billed at the same rate as the base service
- the small-team release model benefits from opening previews intentionally for design/content review instead of for every branch by default

On Render, a reviewer can create a preview by applying the `render-preview` label to the PR or adding `[render preview]` to the PR title.

## Preview contract

Every preview must:

- serve from its own `onrender.com` URL
- show visible release metadata in the page shell
- stay non-indexable in both headers and generated discovery files
- keep analytics off
- keep enquiry and analytics writes on temp storage
- keep all same-origin API abuse defenses active

## Secret and configuration rules

Do not store any of the following in source control:

- production domain assignments
- deploy hook URLs
- live inbox or webhook credentials
- future processor or CMS tokens

Protected configuration locations:

- Render service settings: `SITE_URL` for production only
- GitHub `production` environment secret: `RENDER_DEPLOY_HOOK_URL`
- GitHub `production` environment variable: `PRODUCTION_SITE_URL`

`DEPLOYMENT_CHANNEL` is intentionally not configured on Render. Preview detection comes from `IS_PULL_REQUEST`. Production detection comes from `RENDER`.

## Preview storage and integrations

The base Render service is configured with production disk-backed paths:

- `/var/data/enquiries`
- `/var/data/analytics`

Preview instances must not use those paths for review traffic. The runtime now overrides preview and CI storage to temp directories automatically, so copied production env vars do not create cross-environment data leakage.

The same rule applies to analytics. Even if the base service runs `ANALYTICS_MODE=statistical`, preview and CI channels are forced to `off`.

## Reviewer guidance

Preview review should focus on:

- content and layout changes
- route integrity and footer/legal reachability
- form rendering, validation, and safe success/error states
- trust banners, robots behavior, and preview metadata

Preview review is not the place to test live email delivery or operational inbox routing, because the site deliberately does not use live outbound messaging in this prompt.
