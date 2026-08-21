# 0001 — Astro over Next.js

**Status:** Accepted · 2026-08-21

## Context

A content-driven personal site with a strict Core Web Vitals budget, deployed
free, hand-coded rather than a CMS.

## Decision

Astro 7, static output.

## Rationale

Astro ships zero JavaScript by default; interactivity is opt-in per island.
Next.js ships a React runtime before any of our own code runs, which is a direct
LCP and INP cost for a page that is almost entirely static. Astro also bundles
content collections, image optimisation and a Fonts API, avoiding plugin sprawl.

## Consequences

- Interactive work must be written as isolated islands or plain modules.
- The WebGL hero is a dynamic import with no framework runtime at all.
- If the site ever needs authenticated, per-request rendering, this is revisited.
