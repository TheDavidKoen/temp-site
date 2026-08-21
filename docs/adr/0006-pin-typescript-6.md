# 0006 — Pin TypeScript to 6.x

**Status:** Accepted · 2026-08-21

## Context

Installing TypeScript resolved to 7.0.2, the Go-based native compiler.
`astro check` then failed outright, reporting that the loaded TypeScript module
does not expose the programmatic API it relies on.

## Decision

Pin to `typescript@^6`.

## Rationale

Astro's language server needs an API that TypeScript 7 does not yet ship. This
is an upstream gap, not a configuration error.

## Consequences

- Running a broad dependency update will re-break type checking unless the pin
  holds. This is the most likely cause of a sudden `astro check` failure.
- Revisit when Astro's language server supports the native compiler.
