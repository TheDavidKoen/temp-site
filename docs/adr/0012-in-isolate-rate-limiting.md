# 0012 — In-isolate rate limiting

**Status:** Accepted, with a stated ceiling · 2026-08-25

## Context

`/api/cli` is public, unauthenticated, and promoted on a CV and on LinkedIn. It
does real work per request — seeding a generator, signing a token — so it needs
some ceiling.

Two obvious options were unavailable:

- **WAF rate limiting rules.** The free plan includes one, but they are
  configured per zone, and `is-a.dev` belongs to is-a.dev. Same root cause as
  the custom-domain constraint in ADR 0002.
- **Cloudflare's rate limiter binding.** Not offered to Pages Functions. The
  binding list covers D1, KV, Durable Objects, Queues, R2 and others; rate
  limiting is not among them.

## Decision

A counter held in the Worker isolate's own memory, keyed by `CF-Connecting-IP`:
30 requests per 10 seconds, then 429 with `Retry-After`.

## What this does and does not do

It stops one client hammering one datacentre, which is the realistic nuisance.

It is **not** a distributed rate limit. Isolates are per-datacentre and are
recycled, so traffic spread across regions, or paced slowly, passes through.

## Why that is proportionate

The endpoint writes nothing and stores nothing, so there is no data to lose and
no cost to run away with. The worst case is exhausting the daily Workers request
allowance, which pauses this one route until it resets while the static site
keeps serving — static assets do not draw on that quota.

A nuisance-grade risk did not justify standing up separate infrastructure.

## The alternative, and when to take it

A Durable Object is the correct tool: strongly consistent, single-threaded per
key, built for this. Pages cannot define a Durable Object class, only bind to
one defined in a Worker, so it would mean a second Worker project and a second
deployment.

Revisit if the endpoint ever gains a write path — a leaderboard, a guestbook —
because the calculus changes entirely once requests can persist data.

## Consequences

- The limiter is best effort and the code says so, so nobody mistakes it for a
  guarantee.
- The map is swept on write above 5,000 keys, so a long-lived isolate cannot
  accumulate expired entries.
