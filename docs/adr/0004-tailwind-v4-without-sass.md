# 0004 — Tailwind v4 without Sass

**Status:** Accepted · 2026-08-21

## Context

Sass is widely requested in job listings, and was wanted alongside Tailwind for
that reason.

## Decision

Tailwind CSS v4 alone. No preprocessor.

## Rationale

Tailwind v4 is itself the preprocessor and explicitly does not support Sass,
Less or Stylus — including inside Astro `<style>` blocks. The combination is not
merely unidiomatic; it is unsupported.

The alternatives were both worse. Pinning Tailwind v3 to keep Sass means
shipping a legacy major. Running Sass as an isolated parallel pipeline means two
build systems that never touch, for no engineering benefit.

`@theme`, `@utility`, `@custom-variant`, native nesting and `@import` bundling
cover everything Sass was wanted for.

## Consequences

- Sass experience is evidenced by prior work rather than by this repository.
- Design tokens live in `@theme` in `src/styles/global.css`.
