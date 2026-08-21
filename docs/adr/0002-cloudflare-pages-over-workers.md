# 0002 — Cloudflare Pages over Workers Static Assets

**Status:** Accepted · 2026-08-21

## Context

Cloudflare's own guidance is that new projects should start with Workers Static
Assets; Pages continues to be supported but receives no new investment.

## Decision

Cloudflare Pages.

## Rationale

The site's domain is a free `is-a.dev` subdomain, a zone owned by is-a.dev, not
by us. Workers cannot attach a custom domain on a zone the account does not own.
Pages can. For a purely static site there is no other meaningful gap between the
two — static asset requests are free on both.

## Consequences

- We are on a platform in maintenance rather than active development.
- Migrating to Workers becomes a config change, not a rewrite, if a domain is
  ever bought and its zone moved into the account. That is the trigger to
  revisit this.
