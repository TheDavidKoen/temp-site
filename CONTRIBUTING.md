# Contributing

## Branching

`main` is always deployable. Work happens on short-lived branches merged via
pull request.

| Prefix | For |
|---|---|
| `feat/` | New behaviour or content |
| `fix/` | Correcting broken behaviour |
| `chore/` | Tooling, dependencies, config |
| `docs/` | Documentation only |

Branches are deleted once merged — see
[ADR 0003](docs/adr/0003-github-flow.md). A merged branch is spent: GitHub will
not reopen its pull request for new commits, so further work starts a fresh
branch off `main`.

Always pull after switching:

```sh
git checkout main
git pull
git checkout -b feat/thing
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org/). Subject in the
imperative, under ~70 characters. Use the body to explain *why*, not what.

```
feat: add scroll-driven WebGL hero

Pinned 300vh hero assembles a DK monogram as scroll progresses. Three.js
loads as a lazy chunk behind an IntersectionObserver.
```

## Before opening a pull request

```sh
pnpm verify
```

That runs `astro check` then Biome. Both must be clean. Also run a production
build and the budget check, since some failures only surface there:

```sh
pnpm build
pnpm run budget
```

CI runs all of this plus Lighthouse on every pull request, so a red check means
one of these failed. Reproduce it locally rather than pushing again to see.

Then check, by eye:

- The page at a narrow width, a laptop width, and something ultrawide
- Both pinned sections scrolling smoothly
- Anything animated with reduced motion enabled in OS settings

## Code conventions

**Content goes in `src/consts.ts`,** not in components. Components receive
typed props. Adding a skill or a phrase should be a data edit.

**Design tokens go in `@theme`** in `src/styles/global.css`. No raw hex values
or magic numbers in components.

**Comments mark traps, not intentions.** Write one only where a developer could
break something without it — a cross-file contract, a load-bearing value, a
non-obvious constraint. Rationale belongs in an ADR. Prefer expressive naming
over a comment.

Good:

```css
/* Clip lives on the sticky element itself, never an ancestor — overflow on
   an ancestor would cancel the stickiness. */
```

Not worth writing:

```css
/* Palette derived from the CV so both documents read as one identity. */
```

**Animated components handle `prefers-reduced-motion` themselves.** The global
kill switch only shortens durations, which parks an infinite or scroll-driven
animation mid-cycle instead of stopping it.

## Recording a decision

Anything a future reader would otherwise reverse by accident gets an ADR in
`docs/adr/`, numbered in sequence, following the existing format. Superseded
records stay in place with their status changed.
