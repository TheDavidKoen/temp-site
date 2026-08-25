# 0010 — Terminal commands are a fixed allowlist

**Status:** Accepted · 2026-08-25

## Context

The site exposes a terminal at `/api/cli`, reachable from the page and from
`curl`. A terminal on a website invites the assumption that it runs things.

## Decision

Commands are a fixed map of name to handler. Nothing supplied by a caller is
evaluated, and no handler touches a shell, a filesystem or a network call.

Lookup uses `Object.hasOwn`, not the `in` operator.

## Rationale

`in` walks the prototype chain, so `constructor`, `toString` and `valueOf` all
return true against an object literal. Dispatching on that would call something
never intended as a command. `Object.hasOwn` tests own properties only.

Input is truncated to 64 characters and reduced to its first whitespace-
separated token before lookup. Anything unrecognised returns 404 with the list
of valid commands.

## Consequences

- Adding a command means adding a handler. There is no dynamic surface to grow
  by accident.
- The endpoint cannot be made to execute anything, which is the property worth
  being able to state plainly rather than hoping about.
- `curl .../api/cli?cmd=constructor` returning an ordinary "command not found"
  is the regression test for this decision.
