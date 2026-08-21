# 0007 — Native CSS scroll animations over GSAP

**Status:** Accepted · 2026-08-21

## Context

The site needed several scroll-driven effects. GSAP with ScrollTrigger became
fully free in April 2025, including its former Club plugins, so cost was not a
factor in the decision.

## Decision

Native CSS scroll-driven animations via `animation-timeline`. No animation
library.

## Rationale

Scroll-driven animations run off the main thread, so they cost no INP. A library
would add roughly 50 KB and put every frame back on the main thread, on a page
already carrying a 127 KB WebGL chunk.

## Consequences

- Stagger cannot use `animation-delay`, which scroll-driven animations ignore.
  Per-element offsets are expressed in `animation-range` instead, fed by a
  custom property generated at build time.
- `prefers-reduced-motion` needs handling per component. The global kill switch
  only shortens durations, which parks a scroll-driven animation mid-sweep
  rather than stopping it.
- Unsupported browsers get static content via `@supports`, so no separate
  fallback path is maintained.
