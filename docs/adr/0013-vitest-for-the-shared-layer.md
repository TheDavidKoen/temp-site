# 0013. Vitest, covering `shared/` and `functions/` only

**Status:** Accepted · 2026-09-08

## Context

Until now the repository had no test of any kind. CI ran `astro check`, Biome, a
production build, a performance budget and Lighthouse, and every one of them
passed without asserting that a single behaviour was correct.

Two of those behaviours are the ones this project actually claims. ADR 0010 says
the terminal cannot be made to execute anything and names a `curl` invocation as
its regression test, which nothing ran. ADR 0011 says session state is safe
because it is signed, and its size bound was wrong: the caps in `game.ts` allowed
a state that encoded to 4110 bytes, which the decoder's own 4096-byte limit
rejected, silently ending the player's case.

Neither was found by a type checker, a linter, a bundler or an audit tool,
because neither is that kind of mistake.

## Decision

Vitest, as a dev dependency. Three test files, colocated with what they cover:
`shared/commands.test.ts`, `shared/game.test.ts`, `functions/_session.test.ts`.

`pnpm test` runs them, `pnpm verify` includes them, and CI runs them before the
build.

## Rationale

**Why a runner at all, in a repo that keeps five runtime dependencies.** The cost
is 16 packages, none of them shipped. The thing bought is that the two claims
this project makes loudest are now checked rather than asserted.

**Why Vitest over `node --test`.** The shared modules are TypeScript with
extensionless imports, which Node's own runner cannot resolve without either a
loader or rewriting every import to carry a `.ts` suffix. Vitest already has the
Vite pipeline this project builds with, so it resolves the same graph the build
does, with no config file at all.

**Why the coverage stops where it does.** `shared/` and `functions/` are pure
functions over data, so a test is cheap and states something real. Components are
Astro templates whose behaviour is largely CSS and layout; testing them would
mean a DOM environment and a container renderer to assert things that Lighthouse
and a look at the preview URL already cover better. The line is drawn at the
boundary where a test is worth more than the eye.

## Consequences

- `pnpm verify` is slower by roughly two seconds.
- The retention caps in `game.ts` are now load bearing in a checked way. Raising
  one without `_session.test.ts` passing reintroduces the lost-case bug, and the
  test says so at the point of failure.
- ADR 0010's stated regression test is real, and runs against every name on
  `Object.prototype` rather than the one that was tried by hand.
- Adding a command, a verb or a state field means adding an assertion. That is
  the intended friction.
