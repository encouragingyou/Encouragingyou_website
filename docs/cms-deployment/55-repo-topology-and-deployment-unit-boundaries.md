# Prompt 55 - Repo Topology And Deployment Unit Boundaries

## Chosen topology

The CMS extension stays in the existing monorepo, but it no longer ships as one undifferentiated deployment unit.

The repo now supports three runtime surfaces:

- `shared`
  local and CI only; used to keep full-stack development and broad validation practical inside one workspace
- `public`
  the hosted public website surface
- `admin`
  the hosted administrative surface

The public and admin surfaces are independently deployable products even though they share source control and a single Astro server build.

## Deployment units

Render now defines two separate web services in [render.yaml](/Users/test/Code/new_website/render.yaml):

- `encouragingyou-site-public`
- `encouragingyou-admin`

Each service has:

- its own Render service record
- its own deploy hook
- its own persistent disk path
- its own environment variables
- its own GitHub promotion workflow
- its own runtime surface contract

## What is shared

These areas stay shared because they are code or read-only contracts, not operational trust boundaries:

- presentation templates and design-system code under `site/src`
- the CMS publication contract and generated public read model
- structured content schemas and validators
- deployment helpers such as [site/src/lib/deployment/context.js](/Users/test/Code/new_website/site/src/lib/deployment/context.js:1)
- repo-wide quality tooling, linting, and browser automation

This is acceptable because shared source does not imply shared runtime trust. The public surface still cannot invoke admin write APIs, and the admin surface does not expose public route families.

## What is operationally isolated

These areas are intentionally isolated:

- public deploy hook versus admin deploy hook
- `public-production` GitHub environment versus `admin-production` GitHub environment
- public Render disk at `/var/data` versus admin Render disk at `/var/admin-data`
- public-origin env vars (`SITE_URL`) versus admin-origin env vars (`ADMIN_ORIGIN_URL`, `ADMIN_TOTP_ENCRYPTION_KEYS`, `ADMIN_ADDITIONAL_ALLOWED_ORIGINS`)
- public browser journey suite versus admin-only browser journey suite

## Runtime boundary enforcement

The runtime boundary is enforced in [site/src/middleware.ts](/Users/test/Code/new_website/site/src/middleware.ts:1):

- `public` surface: `/admin/*` and `/api/admin/*` return `404`
- `admin` surface: `/` redirects to `/admin/`
- `admin` surface: public routes and non-health public APIs return `404`
- `admin` surface: only admin pages, admin APIs, `/api/health/`, discovery artifacts, and static assets remain reachable

That means the shared codebase still behaves as two distinct hosted products.

## Local and CI behavior

`shared` remains the default for `local` and `ci` so developers can still run the full public and admin stack together when needed. Hosted deployments do not use that blended surface:

- hosted public defaults to `DEPLOYMENT_SURFACE=public`
- hosted admin uses `DEPLOYMENT_SURFACE=admin`

This keeps developer ergonomics without weakening hosted isolation.

## Render service boundaries

The Render blueprint uses separate build filters and env blocks for each service, so public-only workflow changes do not force admin deploys and vice versa. The admin service also forces:

- `ADMIN_PORTAL_ENABLED=true`
- `ANALYTICS_MODE=off`
- `ADMIN_STORAGE_DIR=/var/admin-data/admin`

The public service forces:

- `ADMIN_PORTAL_ENABLED=false`
- `DEPLOYMENT_SURFACE=public`

## Deliberate tradeoff

The admin portal still uses the same Astro runtime artifact as the public site. That is a source-sharing decision, not a trust-sharing decision.

The remaining hard operational constraint is unchanged from Prompt 54:

- the admin store is still file-backed
- the admin service is still a single-writer deployment
- horizontal scaling is not safe until the admin persistence layer changes

Within that constraint, the repo now has separate deployment units and separate release controls for public and admin.
