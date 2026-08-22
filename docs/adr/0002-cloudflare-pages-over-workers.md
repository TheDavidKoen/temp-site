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

## Amendment, 2026-08-21

Pages does serve custom domains on zones this account does not own, but **not via
the dashboard**. Because `is-a.dev` sits on the Public Suffix List, the dashboard
treats the subdomain as registrable and asks to transfer a zone that belongs to
someone else. The domain had to be attached through the Pages API. The decision
stands; the route to it is not the documented one.

## Consequences

- We are on a platform in maintenance rather than active development.
- Migrating to Workers becomes a config change, not a rewrite, if a domain is
  ever bought and its zone moved into the account. That is the trigger to
  revisit this.
